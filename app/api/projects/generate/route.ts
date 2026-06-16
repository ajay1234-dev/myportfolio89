import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { fetchGithubRepo } from '@/lib/github';
import { generateProjectDescription } from '@/lib/ai';
import { captureScreenshot } from '@/lib/screenshot';

// Tell Vercel to allow this serverless function up to 60 seconds
// (default is 10s which is too short for screenshot capture + Cloudinary upload)
export const maxDuration = 60;


// Helper to parse Firebase ID token and verify admin email
function verifyAdmin(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  try {
    const token = authHeader.split('Bearer ')[1];
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  } catch {
    return false;
  }
}

// POST /api/projects/generate — Generate AI content + screenshot for a single project
export async function POST(req: Request) {
  try {
    const isAdmin = verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    // 1. Get existing project from Firestore
    const projectRef = adminDb.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = projectDoc.data()!;
    const githubUrl = project.githubUrl || '';

    // 2. Extract owner/repo from GitHub URL
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
    }

    const [, owner, repoName] = match;

    // 3. Fetch deep repo details (README, languages, topics)
    console.log(`[Generate] Fetching details for ${owner}/${repoName}...`);
    const repoDetails = await fetchGithubRepo(owner, repoName);

    // 4. Generate AI description via Gemini
    console.log(`[Generate] Running Gemini AI analysis...`);
    const aiContent = await generateProjectDescription(repoDetails);

    // 5. Capture screenshot and upload to Cloudinary
    const screenshotTarget = project.liveUrl || project.githubUrl;
    console.log(`[Generate] Capturing screenshot for: ${screenshotTarget}`);
    const screenshotUrl = await captureScreenshot(screenshotTarget);
    console.log(`[Generate] Screenshot URL result: ${screenshotUrl || 'EMPTY - no image captured'}`);

    // 6. Update project in Firestore
    const update: Record<string, unknown> = {
      title: aiContent.title || project.title,
      description: aiContent.description || project.description,
      features: aiContent.features || project.features,
      techStack: aiContent.techStack || repoDetails.languages || project.techStack,
      status: 'pending', // Move to pending review after generation
      updatedAt: new Date().toISOString(),
    };

    // Only overwrite imageUrl if we actually got a new one
    if (screenshotUrl) {
      update.imageUrl = screenshotUrl;
      console.log('[Generate] imageUrl saved to Firestore:', screenshotUrl);
    } else {
      console.warn('[Generate] No screenshot captured — keeping existing imageUrl:', project.imageUrl || 'none');
    }

    await projectRef.update(update);

    return NextResponse.json({ success: true, ...update, imageUrl: update.imageUrl || project.imageUrl });
  } catch (error: any) {
    console.error('Generate API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

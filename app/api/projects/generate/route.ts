import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { fetchGithubRepo } from '@/lib/github';
import { generateProjectDescription } from '@/lib/ai';
import { captureScreenshot } from '@/lib/screenshot';

// Vercel Pro: 60s. Free: 10s (we work around this with fire-and-forget screenshots)
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

/**
 * Runs the screenshot capture and Cloudinary upload in the background,
 * then updates Firestore when done. This does NOT block the main response.
 */
async function runScreenshotInBackground(projectRef: FirebaseFirestore.DocumentReference, url: string) {
  try {
    console.log(`[Screenshot BG] Starting background capture for: ${url}`);
    const screenshotUrl = await captureScreenshot(url);
    if (screenshotUrl) {
      await projectRef.update({ imageUrl: screenshotUrl, updatedAt: new Date().toISOString() });
      console.log(`[Screenshot BG] ✓ Updated Firestore with: ${screenshotUrl}`);
    } else {
      console.warn('[Screenshot BG] No screenshot URL returned.');
    }
  } catch (err) {
    console.error('[Screenshot BG] Failed:', err);
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

    // 3. Fetch repo details (README, languages, topics)
    console.log(`[Generate] Fetching details for ${owner}/${repoName}...`);
    const repoDetails = await fetchGithubRepo(owner, repoName);

    // 4. Generate AI description
    console.log(`[Generate] Running AI analysis...`);
    const aiContent = await generateProjectDescription(repoDetails);

    // 5. Save AI content to Firestore immediately (fast — doesn't wait for screenshot)
    const update: Record<string, unknown> = {
      title: aiContent.title || project.title,
      description: aiContent.description || project.description,
      features: aiContent.features || project.features,
      techStack: aiContent.techStack || repoDetails.languages || project.techStack,
      status: 'pending',
      updatedAt: new Date().toISOString(),
    };

    await projectRef.update(update);
    console.log('[Generate] ✓ AI content saved to Firestore.');

    // 6. Fire screenshot capture in background — does NOT block this response
    // It will update imageUrl in Firestore when ready (takes 10-30 seconds)
    const screenshotTarget = project.liveUrl || project.githubUrl;
    console.log(`[Generate] 🔄 Starting background screenshot for: ${screenshotTarget}`);
    
    // Use void to explicitly not await — fire and forget
    void runScreenshotInBackground(projectRef, screenshotTarget);

    // 7. Return success immediately — screenshot will update separately
    return NextResponse.json({
      success: true,
      ...update,
      imageUrl: project.imageUrl || null,
      screenshotStatus: 'processing', // tells the client screenshot is in progress
    });

  } catch (error: any) {
    console.error('Generate API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

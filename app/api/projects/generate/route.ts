import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { fetchGithubRepo } from '@/lib/github';
import { generateProjectDescription } from '@/lib/ai';
import { captureScreenshot } from '@/lib/screenshot';

export const maxDuration = 60; // Works on Pro; on free plan functions are limited to 10s

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

// POST /api/projects/generate
export async function POST(req: Request) {
  try {
    const isAdmin = verifyAdmin(req);
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId } = await req.json();
    if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });

    const projectRef = adminDb.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const project = projectDoc.data()!;
    const githubUrl = project.githubUrl || '';

    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });

    const [, owner, repoName] = match;
    const screenshotTarget = project.liveUrl || project.githubUrl;

    // Step 1: Fetch GitHub repo details
    console.log(`[Generate] Fetching repo: ${owner}/${repoName}`);
    const repoDetails = await fetchGithubRepo(owner, repoName);

    // Step 2: Run AI description AND screenshot capture IN PARALLEL
    // This saves 3-5 seconds vs running them sequentially
    console.log(`[Generate] Running AI + screenshot in parallel...`);
    const [aiContent, screenshotUrl] = await Promise.all([
      generateProjectDescription(repoDetails),
      captureScreenshot(screenshotTarget),
    ]);

    console.log(`[Generate] AI done. Screenshot: ${screenshotUrl || 'NONE'}`);

    // Step 3: Build update object
    const update: Record<string, unknown> = {
      title: aiContent.title || project.title,
      description: aiContent.description || project.description,
      features: aiContent.features || project.features,
      techStack: aiContent.techStack || repoDetails.languages || project.techStack,
      status: 'pending',
      updatedAt: new Date().toISOString(),
    };

    if (screenshotUrl) {
      update.imageUrl = screenshotUrl;
      console.log('[Generate] ✓ imageUrl saved:', screenshotUrl);
    } else {
      console.warn('[Generate] No screenshot — keeping existing imageUrl');
    }

    // Step 4: Save to Firestore
    await projectRef.update(update);

    return NextResponse.json({
      success: true,
      ...update,
      imageUrl: update.imageUrl || project.imageUrl || null,
    });

  } catch (error: any) {
    console.error('[Generate] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

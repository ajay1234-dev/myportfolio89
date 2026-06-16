import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';
import { generateProjectDescription } from '@/lib/ai';
import { captureScreenshot } from '@/lib/screenshot';
import { fetchGithubRepo } from '@/lib/github';

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('x-vercel-signature');
    
    // In production, verify this signature using VERCEL_WEBHOOK_SECRET
    // const hmac = crypto.createHmac('sha1', process.env.VERCEL_WEBHOOK_SECRET!);
    // const digest = hmac.update(payload).digest('hex');
    // if (signature !== digest) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = JSON.parse(payload);
    
    if (data.type !== 'deployment.created' && data.type !== 'deployment.succeeded') {
      return NextResponse.json({ message: 'Ignored event type' });
    }
    
    const deployment = data.payload?.deployment || data.payload;
    
    // We ideally only care about production
    if (deployment.target !== 'production') {
      return NextResponse.json({ message: 'Ignored non-production deployment' });
    }

    const liveUrl = `https://${deployment.url}`;
    const githubRepo = deployment.meta?.githubCommitRepo;
    const githubOwner = deployment.meta?.githubCommitOrg;

    if (!githubRepo || !githubOwner) {
      return NextResponse.json({ message: 'No GitHub metadata found' });
    }

    // 1. Fetch repo details
    const repoDetails = await fetchGithubRepo(githubOwner, githubRepo);

    // 2. Generate AI description
    const aiContent = await generateProjectDescription(repoDetails);

    // 3. Capture screenshot (this might take a few seconds)
    const screenshotUrl = await captureScreenshot(liveUrl);

    // 4. Save to Firestore
    const projectRef = adminDb.collection('projects').doc();
    const projectData = {
      id: projectRef.id,
      title: aiContent.title || repoDetails.name,
      description: aiContent.description || repoDetails.description,
      features: aiContent.features || [],
      techStack: aiContent.techStack || repoDetails.languages,
      githubUrl: repoDetails.url,
      liveUrl,
      imageUrl: screenshotUrl,
      status: 'pending',
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await projectRef.set(projectData);

    return NextResponse.json({ success: true, projectId: projectRef.id });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { fetchUserRepos } from '@/lib/github';

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

export async function POST(req: Request) {
  try {
    // 1. Verify Admin Auth
    const isAdmin = verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch ALL GitHub repos (fast — no AI, no screenshots)
    const repos = await fetchUserRepos();
    if (!repos || repos.length === 0) {
      return NextResponse.json({ message: 'No repositories found.' });
    }

    // 3. Save basic info to Firestore, skip repos that already exist
    let syncedCount = 0;

    for (const repo of repos) {
      const existingQuery = await adminDb
        .collection('projects')
        .where('githubUrl', '==', repo.html_url)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        continue; // Already imported
      }

      const projectRef = adminDb.collection('projects').doc();
      const projectData = {
        id: projectRef.id,
        title: repo.name,
        description: repo.description || '',
        features: [],
        techStack: repo.language ? [repo.language] : [],
        githubUrl: repo.html_url,
        liveUrl: repo.homepage || '',
        imageUrl: '', // No screenshot yet
        status: 'imported', // New status — just imported, not reviewed
        featured: false,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        isPrivate: repo.private || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await projectRef.set(projectData);
      syncedCount++;
    }

    return NextResponse.json({ success: true, syncedCount, totalRepos: repos.length });
  } catch (error: any) {
    console.error('GitHub Sync API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

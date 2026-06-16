if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { fetchUserRepos } from '@/lib/github';

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
    const isAdmin = verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repos = await fetchUserRepos();
    if (!repos || repos.length === 0) {
      return NextResponse.json({ message: 'No repositories found.' });
    }

    let updatedCount = 0;

    // Fetch all existing projects from Firestore
    const projectsSnap = await adminDb.collection('projects').get();
    
    const batch = adminDb.batch();

    projectsSnap.docs.forEach((doc) => {
      const data = doc.data();
      // Find matching repo
      const matchedRepo = repos.find(r => r.html_url === data.githubUrl);
      
      if (matchedRepo) {
        const githubLiveUrl = matchedRepo.homepage || '';
        
        // If the live URL changed, update it
        if (data.liveUrl !== githubLiveUrl) {
          batch.update(doc.ref, { 
            liveUrl: githubLiveUrl,
            updatedAt: new Date().toISOString()
          });
          updatedCount++;
        }
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (error: any) {
    console.error('Deployments Sync API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

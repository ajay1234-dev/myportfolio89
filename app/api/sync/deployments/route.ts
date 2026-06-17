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

    // 1. Fetch all current repos from GitHub (source of truth)
    const repos = await fetchUserRepos();
    if (!repos || repos.length === 0) {
      return NextResponse.json({ message: 'No repositories found on GitHub.' });
    }

    // Build a Set of all current GitHub repo URLs for fast lookup
    const liveGithubUrls = new Set(repos.map((r: any) => r.html_url?.toLowerCase().trim()));

    // 2. Fetch all existing projects from Firestore
    const projectsSnap = await adminDb.collection('projects').get();

    const batch = adminDb.batch();
    let updatedCount = 0;
    let deletedCount = 0;

    projectsSnap.docs.forEach((doc) => {
      const data = doc.data();
      const firestoreGithubUrl = (data.githubUrl || '').toLowerCase().trim();

      // Find the matching live GitHub repo
      const matchedRepo = repos.find(
        (r: any) => r.html_url?.toLowerCase().trim() === firestoreGithubUrl
      );

      if (matchedRepo) {
        // ── Repo still exists: update the live URL if it changed ──────────────
        const githubLiveUrl = matchedRepo.homepage || '';
        if (data.liveUrl !== githubLiveUrl) {
          batch.update(doc.ref, {
            liveUrl: githubLiveUrl,
            updatedAt: new Date().toISOString(),
          });
          updatedCount++;
        }
      } else if (firestoreGithubUrl) {
        // ── Repo was deleted from GitHub: remove from Firestore ───────────────
        // Only delete if the project has a githubUrl (not a manually-added project)
        console.log(`[Sync] Deleting stale project: ${data.title} (${data.githubUrl})`);
        batch.delete(doc.ref);
        deletedCount++;
      }
    });

    if (updatedCount > 0 || deletedCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      deletedCount,
      message: `Updated ${updatedCount} URL(s), removed ${deletedCount} deleted repo(s).`,
    });
  } catch (error: any) {
    console.error('Deployments Sync API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

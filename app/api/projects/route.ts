import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminDb } from '@/lib/firebase-admin';

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

// GET /api/projects — returns approved projects (public)
export async function GET() {
  try {
    const snapshot = await adminDb
      .collection('projects')
      .where('status', '==', 'approved')
      .orderBy('createdAt', 'desc')
      .get();

    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json({ projects: [] });
  }
}

// PATCH /api/projects — update a project status (admin only)
export async function PATCH(req: Request) {
  const isAdmin = verifyAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, status, featured, title, description, tagline, techStack, features, githubUrl, liveUrl, imageUrl } = body;
    
    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (status !== undefined) update.status = status;
    if (featured !== undefined) update.featured = featured;
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (tagline !== undefined) update.tagline = tagline;
    if (techStack !== undefined) update.techStack = Array.isArray(techStack) ? techStack : techStack.split(',').map((s: string) => s.trim()).filter(Boolean);
    if (features !== undefined) update.features = Array.isArray(features) ? features : features.split(',').map((s: string) => s.trim()).filter(Boolean);
    if (githubUrl !== undefined) update.githubUrl = githubUrl;
    if (liveUrl !== undefined) update.liveUrl = liveUrl;
    if (imageUrl !== undefined) update.imageUrl = imageUrl;

    await adminDb.collection('projects').doc(id).update(update);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/projects error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE /api/projects — delete a project (admin only)
export async function DELETE(req: Request) {
  const isAdmin = verifyAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await req.json();
    await adminDb.collection('projects').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/projects error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

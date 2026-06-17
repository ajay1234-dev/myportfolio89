import { NextResponse } from 'next/server';
import { captureScreenshot } from '@/lib/screenshot';
import { adminDb } from '@/lib/firebase-admin';

export const maxDuration = 60; // Allow enough time for screenshot

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

// POST /api/screenshot
export async function POST(req: Request) {
  try {
    const isAdmin = verifyAdmin(req);
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

    console.log(`[Screenshot API] Capturing on-demand screenshot for: ${url}`);
    
    // Use the existing utility which takes the screenshot and uploads to Cloudinary
    const imageUrl = await captureScreenshot(url);

    if (imageUrl) {
      return NextResponse.json({ success: true, imageUrl });
    } else {
      return NextResponse.json({ error: 'Failed to capture screenshot. Check the URL and try again.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[Screenshot API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

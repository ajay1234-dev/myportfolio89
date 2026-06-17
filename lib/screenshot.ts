import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadRemoteUrlToCloudinary(imageUrl: string, folder = 'portfolio_projects'): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      imageUrl,
      { folder, quality: 'auto:good', fetch_format: 'auto' },
      (error, result) => {
        if (error || !result) reject(error || new Error('No result'));
        else resolve(result.secure_url);
      }
    );
  });
}

async function uploadBufferToCloudinary(buffer: Buffer, folder = 'portfolio_projects'): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, format: 'webp', quality: 'auto:good' },
      (error, result) => {
        if (error || !result) reject(error || new Error('No result'));
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Captures a screenshot and uploads to Cloudinary.
 * Optimised for speed to fit within Vercel's 10s free-plan serverless limit.
 *
 * Strategy order (fastest first):
 *  1. thum.io      — ~2-3s, no API key needed, direct buffer upload
 *  2. microlink.io — ~4-6s, returns hosted URL, upload to Cloudinary
 *  3. GitHub OG    — instant fallback for any GitHub repo URL
 */
export async function captureScreenshot(url: string): Promise<string> {
  if (!url) return '';

  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
  console.log(`[Screenshot] Capturing: ${url}`);

  // ── STRATEGY 1: thum.io ────────────────────────────────────────────────────
  // Fast (2-3s), no API key, works in all environments.
  // maxAge/0 forces a fresh capture every time (bypasses cache).
  if (!isLocalhost) {
    try {
      const thumUrl = `https://image.thum.io/get/width/1280/crop/800/noanimate/maxAge/0/${url}`;
      console.log(`[Screenshot] Trying thum.io...`);

      const res = await fetch(thumUrl, {
        signal: AbortSignal.timeout(7000), // tight 7s budget
        headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' },
      });

      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.length > 5000) {
          const cloudUrl = await uploadBufferToCloudinary(buffer);
          console.log(`[Screenshot] ✓ thum.io → Cloudinary: ${cloudUrl}`);
          return cloudUrl;
        }
        console.warn(`[Screenshot] thum.io buffer too small (${buffer.length}B)`);
      } else {
        console.warn(`[Screenshot] thum.io HTTP ${res.status}`);
      }
    } catch (e: any) {
      console.warn('[Screenshot] thum.io failed:', e.message);
    }
  }

  // ── STRATEGY 2: microlink.io ───────────────────────────────────────────────
  // Slightly slower but more reliable for SPAs.
  // No waitFor delay here — we need speed to stay within 10s Vercel limit.
  if (!isLocalhost) {
    try {
      const microlinkApi = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url&waitUntil=networkidle0&force=true`;
      console.log(`[Screenshot] Trying microlink.io...`);

      const res = await fetch(microlinkApi, { signal: AbortSignal.timeout(8000) });

      if (res.ok) {
        const data = await res.json() as any;
        const screenshotUrl: string | undefined = data?.data?.screenshot?.url;
        if (screenshotUrl) {
          const cloudUrl = await uploadRemoteUrlToCloudinary(screenshotUrl);
          console.log(`[Screenshot] ✓ microlink.io → Cloudinary: ${cloudUrl}`);
          return cloudUrl;
        }
        console.warn('[Screenshot] microlink.io: no screenshot URL in response');
      } else {
        console.warn(`[Screenshot] microlink.io HTTP ${res.status}`);
      }
    } catch (e: any) {
      console.warn('[Screenshot] microlink.io failed:', e.message);
    }
  }

  // ── STRATEGY 3: GitHub OpenGraph ──────────────────────────────────────────
  // Guaranteed fallback — always works for GitHub URLs.
  const githubMatch = url.match(/github\.com\/([^/?#\s]+\/[^/?#\s]+)/);
  if (githubMatch) {
    const repoPath = githubMatch[1].replace(/\.git$/, '');
    const ogUrl = `https://opengraph.githubassets.com/1/${repoPath}`;
    console.log(`[Screenshot] Falling back to GitHub OG: ${ogUrl}`);
    try {
      const cloudUrl = await uploadRemoteUrlToCloudinary(ogUrl);
      console.log(`[Screenshot] ✓ GitHub OG → Cloudinary: ${cloudUrl}`);
      return cloudUrl;
    } catch {
      return ogUrl; // Return raw URL as absolute last resort
    }
  }

  console.error(`[Screenshot] All strategies failed for: ${url}`);
  return '';
}

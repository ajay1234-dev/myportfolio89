import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Asks Cloudinary to fetch and store a remote image URL.
 * Cloudinary downloads it directly from its own servers — no buffer transfer through our API.
 * This is the most reliable approach for production/serverless environments.
 */
async function uploadRemoteUrlToCloudinary(
  imageUrl: string,
  folder = 'portfolio_projects'
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      imageUrl,
      {
        folder,
        quality: 'auto:good',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary returned no result'));
        } else {
          resolve(result.secure_url);
        }
      }
    );
  });
}

/**
 * Downloads an image buffer and streams it to Cloudinary.
 */
async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder = 'portfolio_projects'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, format: 'webp', quality: 'auto:good' },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary stream upload returned no result'));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    stream.end(buffer);
  });
}

/**
 * Gets a screenshot for a URL and persists it in Cloudinary.
 *
 * Strategy chain (production-safe, no Playwright required):
 *  1. thum.io  → download buffer → upload to Cloudinary
 *  2. microlink.io screenshot API → get image URL → upload to Cloudinary
 *  3. GitHub OpenGraph image → upload to Cloudinary
 *  4. Return raw GitHub OG URL as absolute last resort (no Cloudinary)
 */
export async function captureScreenshot(url: string): Promise<string> {
  if (!url) {
    console.warn('[Screenshot] No URL provided.');
    return '';
  }

  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
  console.log(`[Screenshot] Starting capture for: ${url}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // STRATEGY 1: thum.io
  // Free, no API key, works in all server environments.
  // IMPORTANT: Do NOT encode the URL — thum.io expects it raw at the end of the path.
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isLocalhost) {
    try {
      // Correct format: just append the raw URL directly after the options
      const thumUrl = `https://image.thum.io/get/width/1280/crop/800/noanimate/${url}`;
      console.log(`[Screenshot] Strategy 1 — thum.io: ${thumUrl}`);

      const res = await fetch(thumUrl, {
        signal: AbortSignal.timeout(25000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        },
      });

      console.log(`[Screenshot] thum.io responded: ${res.status} ${res.headers.get('content-type')}`);

      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        console.log(`[Screenshot] thum.io buffer size: ${buffer.length} bytes`);

        // A valid screenshot image is always larger than 5KB
        if (buffer.length > 5000) {
          try {
            const cloudUrl = await uploadBufferToCloudinary(buffer);
            console.log(`[Screenshot] ✓ Strategy 1 (thum.io) succeeded: ${cloudUrl}`);
            return cloudUrl;
          } catch (uploadErr) {
            console.warn('[Screenshot] thum.io buffer upload to Cloudinary failed:', uploadErr);
          }
        } else {
          console.warn(`[Screenshot] thum.io returned too-small buffer (${buffer.length}B). Likely an error page.`);
        }
      } else {
        console.warn(`[Screenshot] thum.io HTTP ${res.status}.`);
      }
    } catch (e: any) {
      console.warn('[Screenshot] Strategy 1 (thum.io) error:', e.message || e);
    }
  } else {
    console.log('[Screenshot] Skipping thum.io — URL is localhost.');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STRATEGY 2: microlink.io screenshot API
  // Free tier (100 requests/day), returns a hosted image URL we can upload.
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isLocalhost) {
    try {
      const microlinkApi = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
      console.log(`[Screenshot] Strategy 2 — microlink.io: ${microlinkApi}`);

      const res = await fetch(microlinkApi, {
        signal: AbortSignal.timeout(20000),
        headers: { 'x-api-key': '' }, // Works without key on free tier
      });

      if (res.ok) {
        const data = await res.json() as any;
        const screenshotUrl = data?.data?.screenshot?.url;
        console.log(`[Screenshot] microlink.io status: ${data?.status}, screenshot URL: ${screenshotUrl}`);

        if (screenshotUrl) {
          try {
            const cloudUrl = await uploadRemoteUrlToCloudinary(screenshotUrl);
            console.log(`[Screenshot] ✓ Strategy 2 (microlink.io) succeeded: ${cloudUrl}`);
            return cloudUrl;
          } catch (uploadErr) {
            console.warn('[Screenshot] microlink.io URL upload to Cloudinary failed:', uploadErr);
          }
        }
      } else {
        console.warn(`[Screenshot] microlink.io HTTP ${res.status}.`);
      }
    } catch (e: any) {
      console.warn('[Screenshot] Strategy 2 (microlink.io) error:', e.message || e);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STRATEGY 3: GitHub OpenGraph social preview image → upload to Cloudinary
  // Works for any GitHub URL (repo, profile, etc.)
  // ─────────────────────────────────────────────────────────────────────────────
  const githubMatch = url.match(/github\.com\/([^/?#\s]+\/[^/?#\s]+)/);
  if (githubMatch) {
    const repoPath = githubMatch[1].replace(/\.git$/, '');
    const ogUrl = `https://opengraph.githubassets.com/1/${repoPath}`;
    console.log(`[Screenshot] Strategy 3 — GitHub OG image: ${ogUrl}`);

    try {
      const cloudUrl = await uploadRemoteUrlToCloudinary(ogUrl);
      console.log(`[Screenshot] ✓ Strategy 3 (GitHub OG) succeeded: ${cloudUrl}`);
      return cloudUrl;
    } catch (uploadErr) {
      console.warn('[Screenshot] GitHub OG upload to Cloudinary failed, returning raw URL:', uploadErr);
      // Return raw URL so the project still shows an image
      return ogUrl;
    }
  }

  console.error(`[Screenshot] All strategies failed for: ${url}`);
  return '';
}

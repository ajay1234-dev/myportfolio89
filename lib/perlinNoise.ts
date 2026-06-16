// Simple 2D Perlin Noise implementation from scratch
// Based on the classic improved Perlin noise algorithm

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number): number {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

class PerlinNoise {
  private perm: number[];

  constructor(seed = 0) {
    // Build permutation table
    const p: number[] = [];
    for (let i = 0; i < 256; i++) p[i] = i;

    // Shuffle with seeded random
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      const j = ((s >>> 0) % (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }

    this.perm = new Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
    }
  }

  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = fade(x);
    const v = fade(y);

    const a = this.perm[X] + Y;
    const aa = this.perm[a];
    const ab = this.perm[a + 1];
    const b = this.perm[X + 1] + Y;
    const ba = this.perm[b];
    const bb = this.perm[b + 1];

    return lerp(
      lerp(grad(this.perm[aa], x, y), grad(this.perm[ba], x - 1, y), u),
      lerp(grad(this.perm[ab], x, y - 1), grad(this.perm[bb], x - 1, y - 1), u),
      v
    );
  }
}

export const perlin = new PerlinNoise(42);
export default PerlinNoise;

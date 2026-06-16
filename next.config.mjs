/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["playwright-core", "playwright", "firebase-admin", "jwks-rsa", "jose"],
    optimizePackageImports: ["framer-motion", "gsap"],
  },
  transpilePackages: ["gsap"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "opengraph.githubassets.com" },
      { protocol: "https", hostname: "image.thum.io" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
    ],
  },
  compress: true,
};

export default nextConfig;

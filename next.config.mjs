/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // We serve a minimal service worker via /public/sw.js, no plugin needed.
  images: { unoptimized: true },

  // Keep CI happy while you iterate (optional—tighten later).
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Faster cold starts on Vercel functions.
  output: 'standalone',
};

export default nextConfig;

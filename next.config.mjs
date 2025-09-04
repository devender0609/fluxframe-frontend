/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Forward all /api/* and /media/* to your backend at runtime
  async rewrites() {
    const apiBase = process.env.BACKEND_ORIGIN || 'https://api.fluxframe.org';
    return [
      { source: '/api/:path*',  destination: `${apiBase}/api/:path*` },
      { source: '/media/:path*', destination: `${apiBase}/media/:path*` },
    ];
  },
};

export default nextConfig;

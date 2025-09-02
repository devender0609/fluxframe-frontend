// next.config.mjs
const backendPort = process.env.BACKEND_PORT || process.env.NEXT_PUBLIC_BACKEND_PORT || "8080";
export default {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/rrapi/:path*", destination: `http://127.0.0.1:${backendPort}/:path*` },
    ];
  },
  env: { BACKEND_PORT: backendPort },
};

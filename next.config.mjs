import withPWA from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  // (keep any existing config you already have)
};

const pwaConfig = {
  dest: "public",
  disable: !isProd,
  register: true,
  skipWaiting: true,
  // IMPORTANT: don't cache user uploads/renders
  runtimeCaching: [
    // keep styles fresh (so all 24 always show)
    {
      urlPattern: /^https:\/\/api\.fluxframe\.org\/api\/styles/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-styles",
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 10, maxAgeSeconds: 60 }
      }
    },
    // never cache remix/status/billing/download
    {
      urlPattern: /^https:\/\/api\.fluxframe\.org\/api\/(remix|status|billing|download)/i,
      handler: "NetworkOnly"
    },
    // never cache rendered media
    {
      urlPattern: /^https:\/\/api\.fluxframe\.org\/media\//i,
      handler: "NetworkOnly"
    }
  ]
};

export default withPWA(pwaConfig)(baseConfig);

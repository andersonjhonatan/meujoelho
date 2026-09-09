const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /\/exercises\/.*\.(png|jpg|jpeg|svg)$/,
      handler: "CacheFirst",
      options: { cacheName: "exercise-images", expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 90 } },
    },
    {
      urlPattern: /^https?:\/\/.*\/api\/.*/,
      handler: "NetworkFirst",
      options: { cacheName: "api-cache", networkTimeoutSeconds: 4, expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 } },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true };

module.exports = withPWA(nextConfig);

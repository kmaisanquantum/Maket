/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/prices.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'supabase-prices-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours offline
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/transport_requests.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-transport-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 6, // 6 hours
        },
        networkTimeoutSeconds: 5,
      },
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: { maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      urlPattern: /\/api\/prices/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-prices',
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store' },
      ],
    },
  ],
};

module.exports = withPWA(nextConfig);

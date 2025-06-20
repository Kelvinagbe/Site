const withSerwist = require('@serwist/next').default({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  scope: '/tools',
  // Removed start_url - this should be defined in your manifest.json instead
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed experimental.appDir - it's deprecated in Next.js 15

  // Add app-specific settings
  env: {
    APP_NAME: 'Apexion',
    APP_DESCRIPTION: 'Transform PDFs with AI technology',
  },

  // PWA and manifest settings
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ]
  },
}

module.exports = withSerwist(nextConfig);
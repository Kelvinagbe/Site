
 /** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },

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
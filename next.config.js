/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for React 19
  experimental: {
    ppr: false, // Disable partial prerendering for now
  },

  // Production optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  // Environment variables that will be available to the client
  env: {
    CUSTOM_KEY: 'value',
  },

  // Image configuration
  images: {
    domains: [
      'localhost',
      'lh3.googleusercontent.com', // Google profile images
    ],
  },

  // Webpack configuration for any custom needs
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Important: return the modified config
    return config;
  },

  // Redirect configuration if needed
  async redirects() {
    return [
      // Add any redirects here if needed
    ];
  },

  // Headers configuration
  async headers() {
    return [
      {
        // Apply headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Rewrites configuration (removed backend proxy as we're using Next.js API routes)
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;

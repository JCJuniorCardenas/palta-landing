import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // La base embebida de desarrollo y el driver de Postgres se cargan en runtime, no se empaquetan
  serverExternalPackages: ['@electric-sql/pglite', 'pg'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
  },
};

export default nextConfig;

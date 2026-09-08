/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: ['images.unsplash.com', 'cdn.jsdelivr.net'],
  },
  experimental: {
    serverComponentsExternalPackages: ['pg', 'ioredis', 'pdf-parse', 'bcryptjs'],
  },
};

module.exports = nextConfig;

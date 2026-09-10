/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: ['images.unsplash.com', 'cdn.jsdelivr.net'],
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules[\\/]pg-mem[\\/]index\.js$/,
        message: /require function is used in a way in which dependencies cannot be statically extracted/,
      },
    ];
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['pg', 'ioredis', 'pdf-parse', 'bcryptjs'],
  },
};

module.exports = nextConfig;

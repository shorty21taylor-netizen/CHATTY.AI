/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["ioredis", "pg"],
  experimental: {
    instrumentationHook: true,
  },
};
module.exports = nextConfig;

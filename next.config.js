/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["ioredis", "pg"],
};
module.exports = nextConfig;

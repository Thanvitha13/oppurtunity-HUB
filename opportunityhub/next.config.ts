import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Native Node.js packages must not be bundled by webpack/turbopack
  serverExternalPackages: ["mongoose", "mongodb-memory-server"],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;

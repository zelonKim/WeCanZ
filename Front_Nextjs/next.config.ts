import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. TypeScript 타입 에러 무시
  typescript: {
    ignoreBuildErrors: true,
  },
  // 2. ESLint 에러 무시
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

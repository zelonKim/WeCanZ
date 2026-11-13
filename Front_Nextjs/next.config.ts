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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-98d574715d174694925389a7ce0c82c4.r2.dev",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-9f60b85ba6ca4d50b1656d2ea61194a7.r2.dev",
      },
    ],
  },
};

export default nextConfig;

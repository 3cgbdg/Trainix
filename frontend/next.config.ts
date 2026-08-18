import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    // exercise/meal images are immutable once generated (deduped by name and
    // reused across all users), so cache them for a year instead of the 60s default
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd1llcprgwazvgp.cloudfront.net',
        pathname: "/**",
      },
      {
        protocol: 'https',
        hostname: 'trainix.s3.eu-north-1.amazonaws.com',
        pathname: "/**",
      },
    ],

  },
  async rewrites() {
    const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
};
export default nextConfig;

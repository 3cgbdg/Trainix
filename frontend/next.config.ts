import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  images: {
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

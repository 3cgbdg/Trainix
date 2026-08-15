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
};
export default nextConfig;

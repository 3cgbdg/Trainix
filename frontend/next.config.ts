import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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

// no-ops (and doesn't fail the build) when SENTRY_AUTH_TOKEN isn't set — it
// just skips source map upload/release management, which needs a real token
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: false,
  telemetry: false,
});

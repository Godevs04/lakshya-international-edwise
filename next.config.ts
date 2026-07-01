import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import {
  getSentryOrg,
  getSentryProject,
  isSentryBuildConfigured,
} from "@/lib/config/sentry-env";

const isProduction = process.env.NODE_ENV === "production";

const cspValue = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data: blob:",
  "connect-src 'self' https://api.cloudinary.com https://*.ingest.sentry.io",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: isProduction ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",
    value: cspValue,
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    qualities: [100, 75],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.lakshyainternationaledwise.com" }],
        destination: "https://lakshyainternationaledwise.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

const sentryOrg = getSentryOrg();
const sentryProject = getSentryProject();

const config = isSentryBuildConfigured()
  ? withSentryConfig(nextConfig, {
      org: sentryOrg!,
      project: sentryProject!,
      silent: !process.env.CI,
      widenClientFileUpload: true,
      // Tunnel avoids ad-blockers in production; direct DSN in dev avoids local proxy noise.
      ...(isProduction ? { tunnelRoute: "/monitoring" } : {}),
      authToken: process.env.SENTRY_AUTH_TOKEN,
      webpack: {
        automaticVercelMonitors: true,
        treeshake: {
          removeDebugLogging: true,
        },
      },
    })
  : nextConfig;

export default config;

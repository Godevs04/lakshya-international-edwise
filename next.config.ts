import { withSentryConfig } from "@sentry/nextjs";
import { withPostHogConfig } from "@posthog/nextjs-config";
import type { NextConfig } from "next";
import {
  getSentryOrg,
  getSentryProject,
  isSentryBuildConfigured,
} from "@/lib/config/sentry-env";
import {
  getPostHogAppHost,
  getPostHogEnvId,
  getPostHogPersonalApiKey,
  isPostHogSourceMapsConfigured,
} from "@/lib/config/posthog-env";

const isProduction = process.env.NODE_ENV === "production";

const cspValue = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data: blob:",
  "connect-src 'self' https://api.cloudinary.com https://*.ingest.sentry.io https://us.i.posthog.com https://us-assets.i.posthog.com",
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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      { source: "/education-loans", destination: "/services/education-loan", permanent: true },
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:slug*", destination: "/", permanent: true },
      { source: "/success-stories", destination: "/#testimonials", permanent: true },
      { source: "/gallery", destination: "/", permanent: true },
      { source: "/services/study-abroad", destination: "/services/education-loan", permanent: true },
      { source: "/services/visa-assistance", destination: "/services/education-loan", permanent: true },
      { source: "/services/scholarships", destination: "/services/education-loan", permanent: true },
      { source: "/services/documentation", destination: "/services/education-loan", permanent: true },
      { source: "/services/travel-insurance", destination: "/services/education-loan", permanent: true },
      { source: "/services/forex", destination: "/services/forex-transfers", permanent: true },
    ];
  },
};

const sentryOrg = getSentryOrg();
const sentryProject = getSentryProject();

let config: NextConfig = nextConfig;

if (isPostHogSourceMapsConfigured()) {
  config = withPostHogConfig(config, {
    personalApiKey: getPostHogPersonalApiKey()!,
    envId: getPostHogEnvId()!,
    host: getPostHogAppHost(),
    sourcemaps: {
      enabled: isProduction,
      project: "lakshya-international-edwise",
      deleteAfterUpload: true,
    },
  });
}

const exportedConfig = isSentryBuildConfigured()
  ? withSentryConfig(config, {
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
  : config;

export default exportedConfig;

import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";
import {
  getPublicSentryDsn,
  getSentryReplaySessionSampleRate,
  getSentryTracesSampleRate,
} from "@/lib/config/sentry-env";
import { getPostHogProjectToken, isPostHogClientEnabled } from "@/lib/config/posthog-env";

const dsn = getPublicSentryDsn();

if (dsn) {
  Sentry.init({
    dsn,
    // Replay is heavy on LCP — keep error-only capture for marketing performance.
    integrations: [Sentry.replayIntegration()],
    tracesSampleRate: getSentryTracesSampleRate(),
    enableLogs: true,
    replaysSessionSampleRate: Math.min(getSentryReplaySessionSampleRate(), 0.05),
    replaysOnErrorSampleRate: 1,
    sendDefaultPii: false,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

function initPostHog() {
  const posthogToken = getPostHogProjectToken();
  if (!isPostHogClientEnabled() || !posthogToken) return;
  posthog.init(posthogToken, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
    // Avoid competing with LCP on first paint.
    capture_pageview: false,
    debug: process.env.NODE_ENV === "development",
  });
  posthog.capture("$pageview");
}

if (typeof window !== "undefined") {
  const schedule =
    "requestIdleCallback" in window
      ? (cb: () => void) => window.requestIdleCallback(cb, { timeout: 3500 })
      : (cb: () => void) => window.setTimeout(cb, 2000);
  schedule(() => initPostHog());
}

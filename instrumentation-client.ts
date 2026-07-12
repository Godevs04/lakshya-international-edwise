import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";
import {
  getPublicSentryDsn,
  getSentryReplaySessionSampleRate,
  getSentryTracesSampleRate,
} from "@/lib/config/sentry-env";
import {
  getPostHogProjectToken,
  isPostHogClientEnabled,
} from "@/lib/config/posthog-env";

const dsn = getPublicSentryDsn();

if (dsn) {
  Sentry.init({
    dsn,
    integrations: [Sentry.replayIntegration()],
    tracesSampleRate: getSentryTracesSampleRate(),
    enableLogs: true,
    replaysSessionSampleRate: getSentryReplaySessionSampleRate(),
    replaysOnErrorSampleRate: 1,
    sendDefaultPii: false,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

const posthogToken = getPostHogProjectToken();
if (isPostHogClientEnabled() && posthogToken) {
  posthog.init(posthogToken, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  });
}

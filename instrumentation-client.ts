import * as Sentry from "@sentry/nextjs";
import {
  getPublicSentryDsn,
  getSentryReplaySessionSampleRate,
  getSentryTracesSampleRate,
} from "@/lib/config/sentry-env";

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

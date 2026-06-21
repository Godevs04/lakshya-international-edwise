import * as Sentry from "@sentry/nextjs";
import { getSentryDsn, getSentryTracesSampleRate } from "@/lib/config/sentry-env";

const dsn = getSentryDsn();

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: getSentryTracesSampleRate(),
    enableLogs: true,
    sendDefaultPii: false,
  });
}

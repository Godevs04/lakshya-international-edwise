import { logger } from "@/lib/logger";

let initialized = false;

export async function initErrorTracking(): Promise<void> {
  if (initialized || typeof window !== "undefined") {
    return;
  }

  initialized = true;

  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn) {
    return;
  }

  try {
    const Sentry = await import("@sentry/node");
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV ?? "development",
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
    });
    logger.info("Sentry error tracking initialized");
  } catch (error) {
    logger.warn("Failed to initialize Sentry", error);
  }
}

export async function captureException(
  error: unknown,
  context?: Record<string, unknown>
): Promise<void> {
  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn || typeof window !== "undefined") {
    return;
  }

  try {
    const Sentry = await import("@sentry/node");
    Sentry.captureException(error, { extra: context });
  } catch {
    // Sentry unavailable — logger already records the error.
  }
}

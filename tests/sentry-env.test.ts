import { describe, it, expect, afterEach } from "vitest";
import {
  getSentryDsn,
  getPublicSentryDsn,
  isSentryBuildConfigured,
  isSentryEnabled,
  getSentryTracesSampleRate,
} from "@/lib/config/sentry-env";

describe("sentry-env", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("detects when sentry is enabled", () => {
    process.env.SENTRY_DSN = "https://key@o0.ingest.sentry.io/1";
    expect(isSentryEnabled()).toBe(true);
    expect(getSentryDsn()).toBe("https://key@o0.ingest.sentry.io/1");
  });

  it("falls back to public dsn for client", () => {
    delete process.env.SENTRY_DSN;
    process.env.NEXT_PUBLIC_SENTRY_DSN = "https://key@o0.ingest.sentry.io/1";
    expect(getPublicSentryDsn()).toBe("https://key@o0.ingest.sentry.io/1");
  });

  it("detects build plugin configuration", () => {
    process.env.SENTRY_AUTH_TOKEN = "token";
    process.env.SENTRY_ORG = "godevs";
    process.env.SENTRY_PROJECT = "lakshya-international-edwise";
    expect(isSentryBuildConfigured()).toBe(true);
  });

  it("parses traces sample rate", () => {
    process.env.SENTRY_TRACES_SAMPLE_RATE = "0.25";
    expect(getSentryTracesSampleRate()).toBe(0.25);
  });
});

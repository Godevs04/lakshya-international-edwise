function trim(value: string | undefined): string | undefined {
  return value?.trim() || undefined;
}

/** Server / edge / build — prefers from git */
export function getSentryDsn(): string | undefined {
  return trim(process.env.SENTRY_DSN) ?? trim(process.env.NEXT_PUBLIC_SENTRY_DSN);
}

/** Browser bundle — public DSN (same value as SENTRY_DSN) */
export function getPublicSentryDsn(): string | undefined {
  return trim(process.env.NEXT_PUBLIC_SENTRY_DSN) ?? trim(process.env.SENTRY_DSN);
}

export function getSentryOrg(): string | undefined {
  return trim(process.env.SENTRY_ORG);
}

export function getSentryProject(): string | undefined {
  return trim(process.env.SENTRY_PROJECT);
}

export function isSentryEnabled(): boolean {
  return Boolean(getSentryDsn());
}

export function isSentryBuildConfigured(): boolean {
  return Boolean(
    trim(process.env.SENTRY_AUTH_TOKEN) && getSentryOrg() && getSentryProject()
  );
}

export function getSentryTracesSampleRate(): number {
  const raw = trim(process.env.SENTRY_TRACES_SAMPLE_RATE);
  if (raw) {
    const rate = Number.parseFloat(raw);
    if (!Number.isNaN(rate) && rate >= 0 && rate <= 1) return rate;
  }
  return process.env.NODE_ENV === "production" ? 0.1 : 1;
}

export function getSentryReplaySessionSampleRate(): number {
  const raw = trim(process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE);
  if (raw) {
    const rate = Number.parseFloat(raw);
    if (!Number.isNaN(rate) && rate >= 0 && rate <= 1) return rate;
  }
  return 0.1;
}

function trim(value: string | undefined): string | undefined {
  return value?.trim() || undefined;
}

/** Browser + server event capture */
export function getPostHogProjectToken(): string | undefined {
  return trim(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);
}

/** Ingest host for posthog-js / posthog-node */
export function getPostHogIngestHost(): string {
  return trim(process.env.NEXT_PUBLIC_POSTHOG_HOST) ?? "https://us.i.posthog.com";
}

/** PostHog app host for API / source map uploads */
export function getPostHogAppHost(): string {
  return trim(process.env.POSTHOG_HOST) ?? "https://us.posthog.com";
}

export function getPostHogProjectId(): string | undefined {
  return trim(process.env.POSTHOG_PROJECT_ID);
}

/** PostHog environment ID for source map uploads (falls back to project ID). */
export function getPostHogEnvId(): string | undefined {
  return trim(process.env.POSTHOG_ENV_ID) ?? getPostHogProjectId();
}

export function getPostHogPersonalApiKey(): string | undefined {
  return trim(process.env.POSTHOG_PERSONAL_API_KEY) ?? trim(process.env.POSTHOG_API_KEY);
}

export function isPostHogClientEnabled(): boolean {
  return Boolean(getPostHogProjectToken());
}

export function isPostHogServerEnabled(): boolean {
  return Boolean(getPostHogProjectToken());
}

export function isPostHogSourceMapsConfigured(): boolean {
  return Boolean(getPostHogPersonalApiKey() && getPostHogEnvId());
}

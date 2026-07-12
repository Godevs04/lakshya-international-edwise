import { PostHog } from "posthog-node";
import {
  getPostHogIngestHost,
  getPostHogProjectToken,
  isPostHogServerEnabled,
} from "@/lib/config/posthog-env";

let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog {
  const token = getPostHogProjectToken();
  if (!token) {
    throw new Error("PostHog is not configured: NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is missing.");
  }

  if (!posthogClient) {
    posthogClient = new PostHog(token, {
      host: getPostHogIngestHost(),
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return posthogClient;
}

export async function captureServerPostHogEvent(
  event: string,
  distinctId: string,
  properties?: Record<string, unknown>
): Promise<void> {
  if (!isPostHogServerEnabled()) return;

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId,
    event,
    properties,
  });
  await posthog.flush();
}

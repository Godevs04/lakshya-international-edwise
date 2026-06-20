import { updateTag } from "next/cache";

export const CACHE_TAGS = {
  dashboard: "dashboard",
  analytics: "analytics",
} as const;

export function revalidateDashboardCaches(): void {
  updateTag(CACHE_TAGS.dashboard);
}

export function revalidateAnalyticsCaches(): void {
  updateTag(CACHE_TAGS.analytics);
}

export function revalidateInsightCaches(): void {
  updateTag(CACHE_TAGS.dashboard);
  updateTag(CACHE_TAGS.analytics);
}

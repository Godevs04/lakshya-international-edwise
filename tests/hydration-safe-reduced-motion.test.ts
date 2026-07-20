import { describe, expect, it } from "vitest";

/**
 * Mirrors the `useSyncExternalStore` contract used by
 * `useHydrationSafeReducedMotion`: server + hydration snapshot is always false.
 */
function resolveHydrationSafeReducedMotion(
  clientMatches: boolean,
  phase: "server" | "hydration" | "client"
): boolean {
  if (phase === "server" || phase === "hydration") return false;
  return clientMatches;
}

describe("hydration-safe reduced motion", () => {
  it("keeps server and hydration snapshots identical", () => {
    expect(resolveHydrationSafeReducedMotion(true, "server")).toBe(false);
    expect(resolveHydrationSafeReducedMotion(true, "hydration")).toBe(false);
    expect(resolveHydrationSafeReducedMotion(false, "server")).toBe(false);
  });

  it("applies the real preference only after hydration", () => {
    expect(resolveHydrationSafeReducedMotion(true, "client")).toBe(true);
    expect(resolveHydrationSafeReducedMotion(false, "client")).toBe(false);
  });
});

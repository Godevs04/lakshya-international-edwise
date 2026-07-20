"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getClientSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerSnapshot() {
  // Must match the first client hydration pass — never read the media query here.
  return false;
}

/**
 * Framer's `useReducedMotion()` is `null` during SSR, then the real media-query
 * value on the client's first paint. Branching the render tree on that causes
 * React #418 hydration mismatches (server HTML vs client empty/different tree).
 *
 * `useSyncExternalStore` keeps SSR and hydration on `false`, then applies the
 * real preference after hydration.
 */
export function useHydrationSafeReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

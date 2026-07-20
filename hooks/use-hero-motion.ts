"use client";

import { useHydrationSafeReducedMotion } from "@/lib/motion/use-hydration-safe-reduced-motion";

export function useHeroMotion() {
  const prefersReducedMotion = useHydrationSafeReducedMotion();

  return {
    prefersReducedMotion,
    planeFly: prefersReducedMotion
      ? {}
      : {
          animate: { x: [0, 16, 0], y: [0, -4, 0] },
          transition: { duration: 8, repeat: Infinity, ease: "easeInOut" as const },
        },
  };
}

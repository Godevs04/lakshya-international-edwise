"use client";

import { useReducedMotion } from "framer-motion";

export function useHeroMotion() {
  const prefersReducedMotion = useReducedMotion();

  return {
    prefersReducedMotion: Boolean(prefersReducedMotion),
    planeFly: prefersReducedMotion
      ? {}
      : {
          animate: { x: [0, 16, 0], y: [0, -4, 0] },
          transition: { duration: 8, repeat: Infinity, ease: "easeInOut" as const },
        },
  };
}

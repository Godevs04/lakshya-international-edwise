"use client";

import { useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export function useMarketingMotion() {
  const prefersReducedMotion = useReducedMotion();

  return {
    prefersReducedMotion: Boolean(prefersReducedMotion),
    fadeInUp: prefersReducedMotion
      ? { initial: {}, whileInView: {}, viewport: { once: true } }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.5, ease: EASE },
        },
    fadeIn: prefersReducedMotion
      ? { initial: {}, whileInView: {}, viewport: { once: true } }
      : {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          viewport: { once: true },
          transition: { duration: 0.45 },
        },
    scaleIn: prefersReducedMotion
      ? { initial: {}, whileInView: {}, viewport: { once: true } }
      : {
          initial: { opacity: 0, scale: 0.96 },
          whileInView: { opacity: 1, scale: 1 },
          viewport: { once: true },
          transition: { duration: 0.45, ease: EASE },
        },
    staggerContainer: prefersReducedMotion
      ? { initial: {}, whileInView: {}, viewport: { once: true } }
      : {
          initial: {},
          whileInView: { transition: { staggerChildren: 0.08 } },
          viewport: { once: true },
        },
    item: prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          transition: { duration: 0.4, ease: EASE },
        },
  };
}

"use client";

import { motion } from "framer-motion";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

export function ProcessTimelineLine() {
  const { prefersReducedMotion } = useMarketingMotion();

  return (
    <>
      <motion.div
        className="absolute left-5 top-0 h-full w-px origin-top bg-primary md:hidden"
        initial={prefersReducedMotion ? false : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      />
      <motion.div
        className="absolute left-1/2 top-0 hidden h-full w-px origin-top -translate-x-1/2 bg-primary md:block"
        initial={prefersReducedMotion ? false : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      />
    </>
  );
}

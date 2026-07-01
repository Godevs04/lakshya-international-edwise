"use client";

import { motion } from "framer-motion";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

export function HeroBackground() {
  const { prefersReducedMotion } = useMarketingMotion();

  if (prefersReducedMotion) {
    return (
      <div className="hero-mesh" aria-hidden>
        <div className="hero-mesh-blob hero-mesh-blob-1" />
        <div className="hero-mesh-blob hero-mesh-blob-2" />
      </div>
    );
  }

  return (
    <div className="hero-mesh" aria-hidden>
      <div className="hero-mesh-blob hero-mesh-blob-1" />
      <div className="hero-mesh-blob hero-mesh-blob-2" />
      <motion.div
        className="hero-mesh-blob hero-mesh-blob-1"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{ opacity: 0.3 }}
      />
    </div>
  );
}

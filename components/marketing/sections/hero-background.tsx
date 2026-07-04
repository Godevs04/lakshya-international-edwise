"use client";

import { motion } from "framer-motion";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

export function HeroBackground() {
  const { prefersReducedMotion } = useMarketingMotion();

  return (
    <div className="hero-mesh" aria-hidden>
      <div className="hero-mesh-blob hero-mesh-blob-1" />
      <div className="hero-mesh-blob hero-mesh-blob-2" />

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.04]"
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <ellipse cx="400" cy="200" rx="320" ry="140" stroke="#0b8fd8" strokeWidth="1" fill="none" />
        <path
          d="M 80 220 Q 200 80 400 140 T 720 100"
          stroke="#0b8fd8"
          strokeWidth="1"
          strokeDasharray="6 8"
          fill="none"
        />
        <path
          d="M 120 280 Q 280 200 480 220 T 680 180"
          stroke="#4fc3f7"
          strokeWidth="0.8"
          strokeDasharray="4 6"
          fill="none"
        />
      </svg>

      {!prefersReducedMotion && (
        <>
          <motion.div
            className="hero-mesh-blob hero-mesh-blob-1"
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            style={{ opacity: 0.3 }}
          />
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-primary/30"
              style={{
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 22}%`,
              }}
              animate={{ opacity: [0.2, 0.6, 0.2], y: [0, -8, 0] }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}

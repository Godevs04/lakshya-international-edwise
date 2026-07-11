"use client";

import { motion } from "framer-motion";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

export function HeroBackground() {
  const { prefersReducedMotion } = useMarketingMotion();

  return (
    <div className="hero-premium-bg" aria-hidden>
      <div className="hero-premium-gradient" />

      <div className="hero-premium-map" />

      <svg
        className="hero-premium-routes"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M 80 420 Q 280 180 520 260 T 920 120 T 1120 200"
          fill="none"
          stroke="url(#routeGrad)"
          strokeWidth="1.2"
          strokeDasharray="8 10"
          opacity="0.35"
        />
        <path
          d="M 40 320 Q 320 80 640 200 T 1080 280"
          fill="none"
          stroke="url(#routeGrad)"
          strokeWidth="0.8"
          strokeDasharray="6 8"
          opacity="0.22"
        />
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0b8fd8" stopOpacity="0" />
            <stop offset="40%" stopColor="#0b8fd8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#4fc3f7" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {!prefersReducedMotion && (
        <motion.svg
          className="hero-premium-routes hero-premium-routes-animated"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid slice"
        >
          <motion.path
            d="M 120 480 Q 400 120 720 220 T 1100 160"
            fill="none"
            stroke="#0b8fd8"
            strokeWidth="1"
            strokeDasharray="4 12"
            opacity="0.2"
            animate={{ strokeDashoffset: [0, -32] }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          />
        </motion.svg>
      )}

      <div className="hero-premium-blur hero-premium-blur-1" />
      <div className="hero-premium-blur hero-premium-blur-2" />
      <div className="hero-premium-blur hero-premium-blur-3" />

      {!prefersReducedMotion &&
        [...Array(8)].map((_, i) => (
          <motion.span
            key={i}
            className="hero-premium-particle"
            style={{
              left: `${12 + i * 11}%`,
              top: `${18 + (i % 4) * 16}%`,
            }}
            animate={{
              opacity: [0.15, 0.45, 0.15],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 5 + i * 0.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.35,
            }}
          />
        ))}
    </div>
  );
}

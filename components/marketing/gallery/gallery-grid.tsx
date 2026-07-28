"use client";

import { motion } from "framer-motion";
import { MarketingLottie } from "@/components/marketing/motion/marketing-lottie";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";
import { useHydrationSafeReducedMotion } from "@/lib/motion/use-hydration-safe-reduced-motion";

export function GalleryGrid() {
  const motionProps = useMarketingMotion();
  const prefersReducedMotion = useHydrationSafeReducedMotion();

  return (
    <motion.div
      className="gallery-coming-soon"
      initial={motionProps.fadeInUp.initial}
      whileInView={motionProps.fadeInUp.whileInView}
      viewport={motionProps.fadeInUp.viewport}
      transition={motionProps.fadeInUp.transition}
    >
      <div className="gallery-coming-soon-glow" aria-hidden />
      <div className="gallery-coming-soon-ring gallery-coming-soon-ring-1" aria-hidden />
      <div className="gallery-coming-soon-ring gallery-coming-soon-ring-2" aria-hidden />

      <div className="gallery-coming-soon-media">
        <MarketingLottie
          preset="about"
          variant="inline"
          className="gallery-coming-soon-lottie"
          playerClassName="gallery-coming-soon-lottie-player"
          reveal={false}
        />
      </div>

      <div className="gallery-coming-soon-copy">
        <span
          className={
            prefersReducedMotion
              ? "gallery-coming-soon-badge"
              : "gallery-coming-soon-badge gallery-coming-soon-badge-pulse"
          }
        >
          Coming Soon
        </span>
        <h3 className="gallery-coming-soon-title">Moments Worth Sharing</h3>
        <p className="gallery-coming-soon-text">
          We&apos;re preparing a curated gallery of counselling sessions, workshops, and student
          success stories from across our offices.
        </p>
        <div className="gallery-coming-soon-progress" aria-hidden>
          <span className="gallery-coming-soon-progress-bar" />
        </div>
      </div>
    </motion.div>
  );
}

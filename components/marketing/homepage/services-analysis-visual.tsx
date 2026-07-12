"use client";

import { motion } from "framer-motion";
import { MarketingLottie } from "@/components/marketing/motion/marketing-lottie";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ServicesAnalysisVisual() {
  const { prefersReducedMotion, floatSlow } = useMarketingMotion();

  return (
    <motion.div
      className="services-bento-analysis-visual"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, delay: 0.34, ease: EASE }}
    >
      <span className="services-bento-analysis-glow" aria-hidden />

      <div className="services-bento-analysis-head">
        <span className="services-bento-dashboard-label">Smart loan analysis</span>
        <span className="services-bento-dashboard-live">
          <span className="services-bento-dashboard-pulse" aria-hidden />
          Live
        </span>
      </div>

      <motion.div
        className="services-bento-analysis-player-wrap"
        {...(prefersReducedMotion
          ? {}
          : {
              animate: floatSlow.animate,
              transition: floatSlow.transition,
            })}
      >
        <MarketingLottie
          preset="business-analysis"
          loop
          reveal={false}
          className="services-bento-analysis-lottie"
          stageClassName="services-bento-analysis-stage"
          playerClassName="services-bento-analysis-player"
        />
        <span className="services-bento-analysis-tint" aria-hidden />
        <span className="services-bento-analysis-vignette" aria-hidden />
      </motion.div>

      <span className="services-bento-analysis-accent" aria-hidden />
    </motion.div>
  );
}

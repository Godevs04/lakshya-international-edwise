"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

const BADGES = [
  "20+ Lending Partners",
  "Approval within 73 Hours",
  "ROI from 8.25%",
  "Trusted by 20,000+ Students",
] as const;

export function HeroTrustBadges() {
  const { prefersReducedMotion } = useMarketingMotion();

  return (
    <ul className="hero-trust-badges mt-6 flex flex-wrap gap-2" aria-label="Trust indicators">
      {BADGES.map((badge, index) => (
        <motion.li
          key={badge}
          className="hero-trust-badge"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.65,
            delay: 0.35 + index * 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          {badge}
        </motion.li>
      ))}
    </ul>
  );
}

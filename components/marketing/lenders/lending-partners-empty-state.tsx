"use client";

import { motion } from "framer-motion";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { MarketingLottie } from "@/components/marketing/motion/marketing-lottie";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

export function LendingPartnersEmptyState() {
  const { prefersReducedMotion } = useMarketingMotion();

  return (
    <motion.div
      className="lender-empty-state"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <MarketingLottie
        preset="search-empty"
        variant="panel"
        panelClassName="lender-empty-lottie-panel"
        stageClassName="lender-empty-lottie-stage"
        playerClassName="lender-empty-lottie-player"
        reveal={false}
      />
      <h3 className="mt-6 text-xl font-bold text-secondary">No lenders in this category</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Try another filter or check your eligibility — we match you across 20+ partners in one
        application.
      </p>
      <EligibilityCta source="lending-partners-empty" className="lender-card-cta mt-8 px-8 py-3.5">
        Check Eligibility
      </EligibilityCta>
    </motion.div>
  );
}

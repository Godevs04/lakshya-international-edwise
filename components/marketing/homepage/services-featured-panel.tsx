"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { LenderLogo } from "@/components/marketing/lenders/lender-logo";
import { getHeroShowcaseLenders } from "@/lib/constants/marketing/lenders";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const TRUST_METRICS = [
  { prefix: "", highlight: "73", suffix: " Hour Approval" },
  { prefix: "Up to ", highlight: "₹2 Cr", suffix: "" },
  { prefix: "ROI from ", highlight: "8.25%", suffix: "" },
  { prefix: "", highlight: "20+", suffix: " Lending Partners" },
] as const;

function FloatingIcon({
  className,
  children,
  delay = 0,
}: {
  className: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const { prefersReducedMotion, floatSlow } = useMarketingMotion();

  return (
    <motion.span
      className={className}
      aria-hidden
      {...(prefersReducedMotion
        ? {}
        : {
            animate: floatSlow.animate,
            transition: { ...floatSlow.transition, delay },
          })}
    >
      {children}
    </motion.span>
  );
}

export function ServicesFeaturedPanel() {
  const lenders = getHeroShowcaseLenders().slice(0, 4);
  const { prefersReducedMotion } = useMarketingMotion();

  return (
    <div className="services-bento-featured-panel">
      <FloatingIcon className="services-bento-float-icon services-bento-float-icon-1" delay={0}>
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <path
            d="M12 3L2 8l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </FloatingIcon>
      <FloatingIcon className="services-bento-float-icon services-bento-float-icon-2" delay={0.8}>
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </FloatingIcon>
      <FloatingIcon className="services-bento-float-icon services-bento-float-icon-3" delay={1.4}>
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <path
            d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </FloatingIcon>

      <motion.div
        className="services-bento-lender-dashboard"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
      >
        <div className="services-bento-dashboard-head">
          <span className="services-bento-dashboard-label">Lender matches</span>
          <span className="services-bento-dashboard-live">
            <span className="services-bento-dashboard-pulse" aria-hidden />
            Live
          </span>
        </div>

        <ul className="services-bento-dashboard-lenders">
          {lenders.map((lender, i) => (
            <motion.li
              key={lender.slug}
              initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.2 + i * 0.08, ease: EASE }}
            >
              <div className="services-bento-dashboard-lender">
                <div
                  className={cn(
                    "services-bento-dashboard-logo-tile",
                    `services-bento-dashboard-logo-tile-${lender.slug}`
                  )}
                >
                  <LenderLogo lender={lender} size="dashboard" fitTile />
                </div>
                <div className="services-bento-dashboard-lender-copy">
                  <span className="services-bento-dashboard-name">{lender.name}</span>
                  <span className="services-bento-dashboard-roi">
                    ROI from {lender.roiFrom}%
                  </span>
                </div>
              </div>
              <span className="services-bento-dashboard-status">Matched</span>
            </motion.li>
          ))}
        </ul>

        <div className="services-bento-dashboard-progress">
          <div className="services-bento-dashboard-progress-head">
            <span>Approval progress</span>
            <motion.span
              className="services-bento-dashboard-progress-pct"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              73%
            </motion.span>
          </div>
          <div className="services-bento-dashboard-progress-track">
            <motion.div
              className="services-bento-dashboard-progress-fill"
              initial={prefersReducedMotion ? false : { width: "0%" }}
              whileInView={{ width: "73%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
            />
          </div>
          <p className="services-bento-dashboard-progress-note">Typical fast-track timeline</p>
        </div>
      </motion.div>

      <ul className="services-bento-trust-metrics">
        {TRUST_METRICS.map((metric, i) => (
          <motion.li
            key={`${metric.highlight}${metric.suffix}`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10px" }}
            transition={{ duration: 0.45, delay: 0.25 + i * 0.08, ease: EASE }}
          >
            <CheckCircle2 className="services-bento-trust-icon" aria-hidden />
            <span>
              {metric.prefix}
              <strong>{metric.highlight}</strong>
              {metric.suffix}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

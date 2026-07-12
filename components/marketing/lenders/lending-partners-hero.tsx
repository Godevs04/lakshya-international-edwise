"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Sparkles,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { MarketingContainer } from "@/components/marketing/layout/marketing-container";
import { AnimatedCounter } from "@/components/marketing/motion/counter";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { LenderLogo } from "@/components/marketing/lenders/lender-logo";
import {
  getHeroShowcaseLenders,
  MARKETING_LENDERS,
} from "@/lib/constants/marketing/lenders";
import { RevealItem, RevealStagger } from "@/components/marketing/motion/reveal";
import { MarketingLottie } from "@/components/marketing/motion/marketing-lottie";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";
import { cn } from "@/lib/utils";

const BAR_DURATION_MS = 800;
const RATE_DURATION_MS = 600;

const TRUST_BADGES = [
  { icon: Sparkles, label: "20+ Lending Partners", value: MARKETING_LENDERS.length, suffix: "+" },
  { icon: Clock, label: "73 Hour Approval", value: 73, suffix: " hrs" },
  { icon: Wallet, label: "₹2 Cr Loan", value: 2, prefix: "₹", suffix: " Cr" },
  { icon: TrendingDown, label: "8.25% ROI", value: 8.25, suffix: "%", decimals: 2 },
] as const;

const TIMELINE = [
  { step: "Apply", pct: 100, active: true },
  { step: "Documents", pct: 78, active: true },
  { step: "Sanction", pct: 52, active: true },
  { step: "Disburse", pct: 24, active: false },
];

const RATE_BARS = [
  { label: "Govt banks", rate: 8.25, width: 42 },
  { label: "Private", rate: 9.5, width: 58 },
  { label: "NBFC", rate: 10.25, width: 72 },
  { label: "Intl.", rate: 9.99, width: 65 },
];

export function LendingPartnersHero() {
  const { prefersReducedMotion } = useMarketingMotion();
  const showcase = getHeroShowcaseLenders().slice(0, 4);

  return (
    <section className="lending-partners-hero section-relative overflow-hidden">
      <div className="lending-partners-hero-bg" aria-hidden>
        <span className="lp-hero-orb lp-hero-orb-1" />
        <span className="lp-hero-orb lp-hero-orb-2" />
        <span className="lp-hero-orb lp-hero-orb-3" />
        <span className="lp-hero-dots" />
      </div>

      <MarketingContainer size="premium" className="relative z-10">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
          <RevealStagger>
            <RevealItem>
              <p className="hero-eyebrow">Lending Partners</p>
            </RevealItem>
            <RevealItem>
              <h1 className="hero-premium-heading mt-4">
                <span className="text-[#0b1e48]">One Application,</span>
                <br />
                <span className="hero-premium-heading-accent">
                  Every Top Lender Compared
                </span>
              </h1>
            </RevealItem>
            <RevealItem>
              <p className="prose-marketing mt-5 max-w-xl text-lg text-muted-foreground">
                Government banks for the lowest rates, NBFCs for speed, and international lenders
                for no-collateral funding — we match you to the best fit in one application.
              </p>
            </RevealItem>
            <RevealItem>
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {TRUST_BADGES.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div key={badge.label} className="lp-trust-badge flex items-center gap-3">
                      <span className="lp-trust-badge-icon flex h-10 w-10 items-center justify-center rounded-xl">
                        <Icon className="h-4 w-4 text-primary" aria-hidden />
                      </span>
                      <div>
                        <p className="text-lg font-bold text-primary">
                          <AnimatedCounter
                            value={badge.value}
                            suffix={badge.suffix}
                            prefix={"prefix" in badge ? badge.prefix : ""}
                            decimals={"decimals" in badge ? badge.decimals : 0}
                            variant="scramble"
                          />
                        </p>
                        <p className="text-xs font-medium text-secondary/75">{badge.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </RevealItem>
            <RevealItem>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <EligibilityCta
                  source="lending-partners-hero"
                  className="lp-hero-primary-cta px-7 py-3.5 text-base"
                >
                  Check Eligibility
                </EligibilityCta>
                <Link href="#lender-marketplace" className="lp-hero-secondary-cta">
                  Compare Lenders
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </RevealItem>
          </RevealStagger>

          <motion.div
            className="lp-hero-dashboard relative"
            {...(prefersReducedMotion
              ? {}
              : {
                  initial: { opacity: 0, x: 32, scale: 0.96 },
                  whileInView: { opacity: 1, x: 0, scale: 1 },
                  viewport: { once: true, amount: 0.2 },
                  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
                })}
          >
            <div className="lp-hero-dashboard-shell">
              <MarketingLottie
                preset="compare-bars"
                variant="inline"
                className="lp-hero-dashboard-lottie-accent"
                playerClassName="lp-hero-dashboard-lottie-player"
              />
              <div className="lp-hero-dashboard-header">
                <MarketingLottie
                  preset="live-pulse"
                  variant="inline"
                  className="lp-hero-live-lottie"
                  playerClassName="lp-hero-live-lottie-player"
                />
                <span className="text-xs font-semibold text-white/90">Live comparison</span>
                <BadgeCheck className="ml-auto h-4 w-4 text-sky-300" aria-hidden />
              </div>

              <div className="lp-hero-dashboard-grid mt-4">
                <div className="lp-hero-glass-card lp-hero-glass-card-wide">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                    Approval timeline
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {TIMELINE.map((item, i) => {
                      const barDelay = 150 + i * 100;
                      return (
                      <li key={item.step}>
                        <div className="mb-1 flex justify-between text-[11px] text-white/75">
                          <span>{item.step}</span>
                          <span>
                            <AnimatedCounter
                              value={item.pct}
                              suffix="%"
                              variant="linear"
                              duration={BAR_DURATION_MS}
                              delay={barDelay}
                            />
                          </span>
                        </div>
                        <div className="lp-hero-progress-track h-1.5 overflow-hidden rounded-full">
                          <motion.span
                            className="lp-hero-progress-fill block h-full rounded-full"
                            initial={prefersReducedMotion ? false : { width: 0 }}
                            whileInView={{ width: `${item.pct}%` }}
                            viewport={{ once: true }}
                            transition={{
                              duration: BAR_DURATION_MS / 1000,
                              delay: barDelay / 1000,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          />
                        </div>
                      </li>
                    );})}
                  </ul>
                </div>

                <div className="lp-hero-glass-card lp-hero-glass-card-rates">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                    ROI compare
                  </p>
                  <ul className="mt-3 space-y-2">
                    {RATE_BARS.map((bar, i) => {
                      const barDelay = 200 + i * 80;
                      return (
                      <li key={bar.label} className="flex items-center gap-2">
                        <span className="w-14 shrink-0 text-[10px] text-white/70">{bar.label}</span>
                        <div className="lp-hero-rate-track h-2 min-w-0 flex-1 overflow-hidden rounded-full">
                          <motion.span
                            className="lp-hero-rate-fill block h-full rounded-full"
                            style={{ width: `${bar.width}%` }}
                            initial={prefersReducedMotion ? false : { scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{
                              duration: RATE_DURATION_MS / 1000,
                              delay: barDelay / 1000,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          />
                        </div>
                        <span className="w-11 shrink-0 text-right text-[10px] font-bold tabular-nums text-sky-200">
                          <AnimatedCounter
                            value={bar.rate}
                            suffix="%"
                            decimals={2}
                            variant="linear"
                            duration={RATE_DURATION_MS}
                            delay={barDelay}
                          />
                        </span>
                      </li>
                    );})}
                  </ul>
                </div>

                <div className="lp-hero-glass-card lp-hero-glass-card-logos">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                    Matched lenders
                  </p>
                  <div className="lp-hero-logo-grid mt-3">
                    {showcase.map((lender) => (
                      <div
                        key={lender.slug}
                        className={cn(
                          "lp-hero-logo-tile",
                          `lp-hero-logo-tile-${lender.slug}`
                        )}
                      >
                        <LenderLogo
                          lender={lender}
                          size="card"
                          fitTile
                          imageSizes="(max-width: 640px) 28vw, 140px"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <span className="lp-hero-particle lp-hero-particle-1" aria-hidden />
              <span className="lp-hero-particle lp-hero-particle-2" aria-hidden />
              <span className="lp-hero-particle lp-hero-particle-3" aria-hidden />
            </div>
          </motion.div>
        </div>
      </MarketingContainer>
    </section>
  );
}

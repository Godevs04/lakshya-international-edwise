"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MarketingContainer } from "@/components/marketing/layout/marketing-container";
import { HeroBackground } from "@/components/marketing/sections/hero-background";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { LenderLogo } from "@/components/marketing/lenders/lender-logo";
import { Reveal, RevealStagger, RevealItem } from "@/components/marketing/motion/reveal";
import { getHeroShowcaseLenders } from "@/lib/constants/marketing/lenders";
import { useMouseParallax } from "@/hooks/use-mouse-parallax";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";
import {
  CheckCircle2,
  TrendingUp,
  Clock,
  Wallet,
  ArrowRight,
  Globe,
  Building2,
  BadgeCheck,
} from "lucide-react";

const HERO_HIGHLIGHTS = [
  { icon: TrendingUp, label: "ROI from 8.25%" },
  { icon: Clock, label: "73-hour approvals" },
  { icon: Wallet, label: "Up to ₹2 Cr, 100% coverage" },
];

const DASHBOARD_ROWS = [
  { label: "Loan Amount", value: "₹2 Cr", icon: Wallet },
  { label: "ROI", value: "8.25%", icon: TrendingUp },
  { label: "Approval Time", value: "73 hrs", icon: Clock },
  { label: "Funding", value: "100%", icon: BadgeCheck },
  { label: "Lender", value: "SBI · Credila", icon: Building2 },
  { label: "Status", value: "Pre-approved", icon: BadgeCheck },
  { label: "Destination", value: "USA · Canada", icon: Globe },
];

export function FinanceHero() {
  const showcaseLenders = getHeroShowcaseLenders();
  const parallax = useMouseParallax();
  const { floatSlow, prefersReducedMotion } = useMarketingMotion();
  const [activeRow, setActiveRow] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveRow((current) => (current + 1) % DASHBOARD_ROWS.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  const current = DASHBOARD_ROWS[activeRow]!;
  const RowIcon = current.icon;

  return (
    <section
      data-journey-node="hero"
      className="hero-gradient section-relative overflow-hidden pb-16 pt-16 md:pb-24 md:pt-20"
    >
      <HeroBackground />

      <MarketingContainer className="relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <RevealStagger className="space-y-0">
            <RevealItem>
              <p className="accent-chip">Your Dream. Our Lakshya.</p>
            </RevealItem>
            <RevealItem>
              <h1 className="heading-display mt-5 text-foreground">
                Your Journey,
                <br />
                <span className="text-primary">Our Financial Expertise.</span>
              </h1>
            </RevealItem>
            <RevealItem>
              <p className="prose-marketing mt-6 text-muted-foreground">
                Making global education affordable, accessible, and achievable — with the
                right education loan from 20+ trusted lending partners.
              </p>
            </RevealItem>
            <RevealItem>
              <div className="mt-8 flex flex-wrap gap-4">
                {HERO_HIGHLIGHTS.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </span>
                ))}
              </div>
            </RevealItem>
            <RevealItem>
              <div className="mt-8 flex flex-wrap gap-3">
                <EligibilityCta source="hero" className="px-7 py-3.5 text-base" />
                <Link
                  href="/become-a-partner"
                  className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-white px-7 py-3.5 text-base font-semibold text-primary transition-colors hover:border-primary/50 hover:bg-accent/40"
                >
                  Become a Partner
                </Link>
              </div>
            </RevealItem>
            <RevealItem>
              <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                No hidden charges · Free expert guidance · Every top lender compared
              </p>
            </RevealItem>
          </RevealStagger>

          <Reveal delay={0.15}>
            <motion.div
              className="relative"
              style={{
                transform: prefersReducedMotion
                  ? undefined
                  : `translate(${parallax.x}px, ${parallax.y}px)`,
              }}
            >
              <motion.div
                className="consultation-card rounded-3xl p-6"
                {...(prefersReducedMotion ? {} : floatSlow)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Financial dashboard</p>
                  <span className="accent-chip">Live rates</span>
                </div>

                <motion.div
                  key={activeRow}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-5 rounded-2xl border border-primary/15 bg-gradient-to-br from-accent/60 to-white p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <RowIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {current.label}
                      </p>
                      <p className="text-2xl font-bold text-primary">{current.value}</p>
                    </div>
                  </div>
                </motion.div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {DASHBOARD_ROWS.slice(0, 4).map((row, index) => (
                    <button
                      key={row.label}
                      type="button"
                      onClick={() => setActiveRow(index)}
                      className={`rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                        activeRow === index
                          ? "bg-primary/10 font-semibold text-primary"
                          : "bg-accent/40 text-muted-foreground hover:bg-accent/60"
                      }`}
                    >
                      {row.label}
                    </button>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-border/60 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Banks · NBFCs · Global lenders
                    </p>
                    <Link
                      href="/lending-partners"
                      className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-primary hover:underline"
                    >
                      View all
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {showcaseLenders.map((lender) => (
                      <div
                        key={lender.slug}
                        className="flex h-11 items-center justify-center rounded-xl bg-white px-2 shadow-sm ring-1 ring-black/[0.04]"
                        title={lender.name}
                      >
                        <LenderLogo lender={lender} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>

                <EligibilityCta source="hero-card" className="mt-5 w-full py-3 text-sm" />
              </motion.div>
            </motion.div>
          </Reveal>
        </div>
      </MarketingContainer>
    </section>
  );
}

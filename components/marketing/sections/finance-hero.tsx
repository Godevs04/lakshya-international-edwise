"use client";

import { MarketingContainer } from "@/components/marketing/layout/marketing-container";
import { HeroBackground } from "@/components/marketing/sections/hero-background";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { LenderLogo } from "@/components/marketing/lenders/lender-logo";
import { getHeroShowcaseLenders } from "@/lib/constants/marketing/lenders";
import { CheckCircle2, TrendingUp, Clock, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";

const HERO_HIGHLIGHTS = [
  { icon: TrendingUp, label: "ROI from 8.25%" },
  { icon: Clock, label: "73-hour approvals" },
  { icon: Wallet, label: "Up to ₹2 Cr, 100% coverage" },
];

export function FinanceHero() {
  const showcaseLenders = getHeroShowcaseLenders();

  return (
    <section className="hero-gradient relative overflow-hidden pb-16 pt-16 md:pb-24 md:pt-20">
      <HeroBackground />

      <MarketingContainer className="relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="accent-chip">Your Dream. Our Lakshya.</p>
            <h1 className="heading-display mt-5 text-foreground">
              Your Journey,
              <br />
              <span className="text-primary">Our Financial Expertise.</span>
            </h1>
            <p className="prose-marketing mt-5 text-lg text-muted-foreground">
              Making global education affordable, accessible, and achievable — with the
              right education loan from 20+ trusted lending partners.
            </p>

            <div className="mt-7 flex flex-wrap gap-4">
              {HERO_HIGHLIGHTS.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <EligibilityCta source="hero" className="px-7 py-3.5 text-base" />
              <Link
                href="/become-a-partner"
                className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-white px-7 py-3.5 text-base font-semibold text-primary transition-colors hover:border-primary/50 hover:bg-accent/40"
              >
                Become a Partner
              </Link>
            </div>

            <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" />
              No hidden charges · Free expert guidance · Every top lender compared
            </p>
          </div>

          <div className="relative">
            <div className="consultation-card rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Loan snapshot</p>
                <span className="accent-chip">Live rates</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-accent/50 p-4">
                  <p className="text-2xl font-bold text-primary">₹2 Cr</p>
                  <p className="text-xs text-muted-foreground">Max loan amount</p>
                </div>
                <div className="rounded-2xl bg-accent/50 p-4">
                  <p className="text-2xl font-bold text-primary">8.25%</p>
                  <p className="text-xs text-muted-foreground">Interest from</p>
                </div>
                <div className="rounded-2xl bg-accent/50 p-4">
                  <p className="text-2xl font-bold text-primary">73 hrs</p>
                  <p className="text-xs text-muted-foreground">Avg. approval</p>
                </div>
                <div className="rounded-2xl bg-accent/50 p-4">
                  <p className="text-2xl font-bold text-primary">100%</p>
                  <p className="text-xs text-muted-foreground">Cost coverage</p>
                </div>
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
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}

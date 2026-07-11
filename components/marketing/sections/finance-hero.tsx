"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingContainer } from "@/components/marketing/layout/marketing-container";
import { HeroBackground } from "@/components/marketing/sections/hero-background";
import { LenderLogoCarouselTrack } from "@/components/marketing/sections/lender-logo-carousel-track";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { HeroComposition } from "@/components/marketing/homepage/hero-composition";
import { HeroTrustBadges } from "@/components/marketing/homepage/hero-trust-badges";
import { Reveal, RevealItem, RevealStagger } from "@/components/marketing/motion/reveal";

export function FinanceHero() {
  return (
    <section
      data-journey-node="hero"
      className="hero-premium section-relative overflow-x-hidden pb-16 pt-10 md:pb-20 md:pt-14"
    >
      <HeroBackground />

      <MarketingContainer size="premium" className="relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <RevealStagger>
            <RevealItem>
              <p className="hero-eyebrow">Your Dream. Our Lakshya.</p>
            </RevealItem>
            <RevealItem>
              <h1 className="hero-premium-heading mt-4">
                <span className="text-[#0b1e48]">Your Journey,</span>
                <br />
                <span className="hero-premium-heading-accent">Our Financial Expertise.</span>
              </h1>
            </RevealItem>
            <RevealItem>
              <p className="hero-premium-subcopy mt-5">
                Making global education{" "}
                <span className="font-semibold text-primary">
                  affordable, accessible, and achievable
                </span>{" "}
                — with the right education loan from 20+ trusted lending partners.
              </p>
            </RevealItem>
            <RevealItem>
              <HeroTrustBadges />
            </RevealItem>
            <RevealItem>
              <div className="mt-8 flex flex-wrap gap-3">
                <EligibilityCta
                  source="hero"
                  className="btn-premium-primary group px-7 py-3.5 text-base"
                >
                  Check Eligibility
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </EligibilityCta>
                <Link href="/become-a-partner" className="btn-premium-ghost px-7 py-3.5 text-base">
                  Become a Partner
                </Link>
              </div>
            </RevealItem>
            <RevealItem>
              <div className="hero-mini-stats mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { value: "20K+", label: "Students" },
                  { value: "20+", label: "Lenders" },
                  { value: "73h", label: "Approval" },
                  { value: "8.25%", label: "ROI from" },
                ].map((stat) => (
                  <div key={stat.label} className="hero-mini-stat">
                    <p className="hero-mini-stat-value">{stat.value}</p>
                    <p className="hero-mini-stat-label">{stat.label}</p>
                  </div>
                ))}
              </div>
            </RevealItem>
          </RevealStagger>

          <Reveal delay={0.15}>
            <HeroComposition />
          </Reveal>
        </div>

        <div className="mt-10 md:mt-12" data-journey-node="lenders">
          <div className="premium-marquee-header mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="hero-eyebrow">20+ Trusted Lending Partners</p>
              <h2 className="mt-2 text-xl font-bold text-[#0b1e48] md:text-2xl">
                One application, every top lender
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Compare rates across banks and NBFCs for the lowest interest and fastest approval.
            </p>
          </div>
          <LenderLogoCarouselTrack premium />
        </div>
      </MarketingContainer>
    </section>
  );
}

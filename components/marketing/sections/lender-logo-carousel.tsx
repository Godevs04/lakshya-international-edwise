"use client";

import { MarketingContainer } from "@/components/marketing/layout/marketing-container";
import { LenderLogo } from "@/components/marketing/lenders/lender-logo";
import {
  MARKETING_LENDERS,
  LENDER_CATEGORY_LABELS,
} from "@/lib/constants/marketing/lenders";
import { useEligibilityModal } from "@/hooks/use-eligibility-modal";

export function LenderLogoCarousel() {
  const { open } = useEligibilityModal();
  const loop = [...MARKETING_LENDERS, ...MARKETING_LENDERS];

  return (
    <section
      data-journey-node="lenders"
      className="section-relative section-tint section-padding"
      aria-labelledby="lenders-heading"
    >
      <MarketingContainer>
        <div className="mb-8 text-center">
          <p className="accent-chip mx-auto">20+ Trusted Lending Partners</p>
          <h2 id="lenders-heading" className="heading-section mt-4 text-foreground">
            One application, every top lender
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Select your preferred lender — we compare rates across banks and NBFCs so you
            get the lowest interest and fastest approval.
          </p>
        </div>
      </MarketingContainer>

      <div className="lender-carousel relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--section-tint)] to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--section-tint)] to-transparent"
          aria-hidden
        />
        <ul className="lender-track" role="list">
          {loop.map((lender, index) => (
            <li key={`${lender.slug}-${index}`}>
              <div className="lender-logo-wrap group relative">
                <button
                  type="button"
                  onClick={() =>
                    open({ preferredLender: lender.name, source: "lender-carousel" })
                  }
                  className="lender-logo group flex h-[4.5rem] min-w-[6.5rem] items-center justify-center rounded-xl bg-white px-4 shadow-sm ring-1 ring-transparent transition-all hover:scale-[1.08] hover:shadow-md hover:ring-primary/20"
                  aria-label={`Check eligibility with ${lender.name}`}
                >
                  <LenderLogo lender={lender} size="lg" />
                </button>
                <div
                  className="lender-tooltip absolute bottom-full left-1/2 z-20 mb-2 w-44 -translate-x-1/2 rounded-xl border border-border bg-white p-3 text-left shadow-lg"
                  role="tooltip"
                >
                  <p className="text-xs font-semibold text-foreground">{lender.name}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {LENDER_CATEGORY_LABELS[lender.category]}
                  </p>
                  <p className="mt-1 text-[10px] text-primary">
                    ROI from {lender.roiFrom}% · {lender.processingLabel}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <MarketingContainer>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Hover to pause · Click a lender to check eligibility
        </p>
      </MarketingContainer>
    </section>
  );
}

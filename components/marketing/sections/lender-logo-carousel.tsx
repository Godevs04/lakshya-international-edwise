"use client";

import { MarketingContainer } from "@/components/marketing/layout/marketing-container";
import { LenderLogo } from "@/components/marketing/lenders/lender-logo";
import { MARKETING_LENDERS } from "@/lib/constants/marketing/lenders";
import { useEligibilityModal } from "@/hooks/use-eligibility-modal";

export function LenderLogoCarousel() {
  const { open } = useEligibilityModal();
  const loop = [...MARKETING_LENDERS, ...MARKETING_LENDERS];

  return (
    <section className="section-tint section-padding" aria-labelledby="lenders-heading">
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
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--section-tint)] to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--section-tint)] to-transparent"
          aria-hidden
        />
        <ul className="lender-track" role="list">
          {loop.map((lender, index) => (
            <li key={`${lender.slug}-${index}`}>
              <button
                type="button"
                onClick={() =>
                  open({ preferredLender: lender.name, source: "lender-carousel" })
                }
                className="lender-logo group flex h-16 items-center justify-center rounded-xl bg-white px-6 shadow-sm"
                aria-label={`Check eligibility with ${lender.name}`}
              >
                <LenderLogo lender={lender} />
              </button>
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

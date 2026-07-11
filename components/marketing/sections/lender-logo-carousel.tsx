"use client";

import { MarketingContainer } from "@/components/marketing/layout/marketing-container";
import { LenderLogoCarouselTrack } from "@/components/marketing/sections/lender-logo-carousel-track";

export function LenderLogoCarousel() {
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

      <LenderLogoCarouselTrack />

      <MarketingContainer>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <span className="hidden sm:inline">Hover for details · </span>
          Tap for details on mobile · Click to check eligibility
        </p>
      </MarketingContainer>
    </section>
  );
}

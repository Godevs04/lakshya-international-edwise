"use client";

import { useCallback, useState } from "react";
import { MarketingContainer } from "@/components/marketing/layout/marketing-container";
import { LenderLogo, LENDER_LOGO_MARKETING_SIZE, LENDER_LOGO_TILE_CLASS } from "@/components/marketing/lenders/lender-logo";
import {
  MARKETING_LENDERS,
  LENDER_CATEGORY_LABELS,
} from "@/lib/constants/marketing/lenders";
import { useEligibilityModal } from "@/hooks/use-eligibility-modal";
import { cn } from "@/lib/utils";

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export function LenderLogoCarousel() {
  const { open } = useEligibilityModal();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handleLenderClick = useCallback(
    (lender: (typeof MARKETING_LENDERS)[number]) => {
      if (isTouchDevice() && activeTooltip !== lender.slug) {
        setActiveTooltip(lender.slug);
        return;
      }
      setActiveTooltip(null);
      open({ preferredLender: lender.name, source: "lender-carousel" });
    },
    [activeTooltip, open]
  );

  const renderLender = (lender: (typeof MARKETING_LENDERS)[number], index: number) => {
    const tooltipOpen = activeTooltip === lender.slug;

    return (
      <li key={`${lender.slug}-${index}`}>
        <div className="lender-logo-wrap group relative">
          <button
            type="button"
            onClick={() => handleLenderClick(lender)}
            onMouseEnter={() => setActiveTooltip(lender.slug)}
            onMouseLeave={() =>
              setActiveTooltip((current) => (current === lender.slug ? null : current))
            }
            className={cn(
              "lender-logo group min-w-[8rem] transition-all hover:scale-[1.06] hover:shadow-md hover:ring-primary/20",
              LENDER_LOGO_TILE_CLASS,
              "ring-transparent"
            )}
            aria-label={`Check eligibility with ${lender.name}`}
            aria-expanded={tooltipOpen}
          >
            <LenderLogo lender={lender} size={LENDER_LOGO_MARKETING_SIZE} />
          </button>

          <div
            className={cn(
              "lender-tooltip absolute bottom-full left-1/2 z-20 mb-2 w-44 -translate-x-1/2 rounded-xl border border-border bg-white p-3 text-left shadow-lg",
              tooltipOpen && "lender-tooltip-visible"
            )}
            role="tooltip"
          >
            <p className="text-xs font-semibold text-foreground">{lender.name}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {LENDER_CATEGORY_LABELS[lender.category]}
            </p>
            <p className="mt-1 text-[10px] text-primary">
              ROI from {lender.roiFrom}% · {lender.processingLabel}
            </p>
            {tooltipOpen && isTouchDevice() && (
              <p className="mt-2 text-[10px] font-medium text-muted-foreground">
                Tap again to check eligibility
              </p>
            )}
          </div>
        </div>
      </li>
    );
  };

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
          {MARKETING_LENDERS.map((lender, index) => renderLender(lender, index))}
          {MARKETING_LENDERS.map((lender, index) => renderLender(lender, index + MARKETING_LENDERS.length))}
        </ul>
      </div>

      <MarketingContainer>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <span className="hidden sm:inline">Hover for details · </span>
          Tap for details on mobile · Click to check eligibility
        </p>
      </MarketingContainer>
    </section>
  );
}

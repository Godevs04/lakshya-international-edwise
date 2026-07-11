"use client";

import { useCallback, useState } from "react";
import {
  LenderLogo,
  LENDER_LOGO_MARKETING_SIZE,
  LENDER_LOGO_TILE_CLASS,
} from "@/components/marketing/lenders/lender-logo";
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

interface LenderLogoCarouselTrackProps {
  className?: string;
  premium?: boolean;
}

export function LenderLogoCarouselTrack({ className, premium = false }: LenderLogoCarouselTrackProps) {
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
              "lender-logo group min-w-[8rem] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.04] hover:shadow-lg hover:ring-primary/15",
              LENDER_LOGO_TILE_CLASS,
              premium && "lender-carousel-premium-tile",
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
    <div className={cn("lender-carousel relative overflow-hidden", premium && "lender-carousel-premium", className)}>
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r to-transparent",
          premium ? "from-[#f8fbff]" : "from-white/90"
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l to-transparent",
          premium ? "from-[#f8fbff]" : "from-white/90"
        )}
        aria-hidden
      />
      <ul className="lender-track" role="list">
        {MARKETING_LENDERS.map((lender, index) => renderLender(lender, index))}
        {MARKETING_LENDERS.map((lender, index) =>
          renderLender(lender, index + MARKETING_LENDERS.length)
        )}
      </ul>
    </div>
  );
}

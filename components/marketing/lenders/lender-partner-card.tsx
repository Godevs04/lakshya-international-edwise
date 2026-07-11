"use client";

import { memo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Clock,
  Shield,
  Sparkles,
  TrendingDown,
  Wallet,
} from "lucide-react";
import {
  LenderLogo,
  LENDER_LOGO_CARD_SIZE,
  LENDER_CARD_LOGO_WELL_CLASS,
} from "@/components/marketing/lenders/lender-logo";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { LENDER_CATEGORY_LABELS } from "@/lib/constants/marketing/lenders";
import type { MarketingLender } from "@/types/marketing";
import { cn } from "@/lib/utils";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

export type LenderFeaturedBadge = "top" | "popular" | "fast" | "roi";

const BADGE_CONFIG: Record<
  LenderFeaturedBadge,
  { label: string; className: string }
> = {
  top: { label: "Recommended", className: "lender-badge-top" },
  popular: { label: "Most Popular", className: "lender-badge-popular" },
  fast: { label: "Fastest", className: "lender-badge-fast" },
  roi: { label: "Lowest ROI", className: "lender-badge-roi" },
};

export function getLenderFeaturedBadge(
  lender: MarketingLender
): LenderFeaturedBadge | null {
  const map: Partial<Record<string, LenderFeaturedBadge>> = {
    credila: "top",
    "prodigy-finance": "top",
    incred: "popular",
    "icici-bank": "popular",
    avanse: "fast",
    sbi: "roi",
    "bank-of-baroda": "roi",
  };
  return map[lender.slug] ?? (lender.featured ? "popular" : null);
}

const EASE = [0.22, 1, 0.36, 1] as const;

const PRIMARY_STATS = (lender: MarketingLender) => [
  { icon: TrendingDown, label: "ROI", value: `${lender.roiFrom}%` },
  { icon: Wallet, label: "Loan", value: lender.maxLoanLabel.replace(/^Up to /i, "") },
  { icon: Clock, label: "Approval", value: lender.processingLabel },
];

interface LenderPartnerCardProps {
  lender: MarketingLender;
  index: number;
  isCompareSelected?: boolean;
  compareDisabled?: boolean;
  onToggleCompare?: () => void;
}

function LenderPartnerCardInner({
  lender,
  index,
  isCompareSelected = false,
  compareDisabled = false,
  onToggleCompare,
}: LenderPartnerCardProps) {
  const { prefersReducedMotion } = useMarketingMotion();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const badge = getLenderFeaturedBadge(lender);
  const badgeMeta = badge ? BADGE_CONFIG[badge] : null;

  const toggleDetails = useCallback(() => {
    setDetailsOpen((open) => !open);
  }, []);

  return (
    <motion.article
      className={cn(
        "lender-marketplace-card group relative flex h-full flex-col",
        isCompareSelected && "lender-marketplace-card-selected",
        detailsOpen && "lender-card-details-open"
      )}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-32px", amount: 0.1 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: EASE }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : { y: -8, scale: 1.02, transition: { duration: 0.3, ease: EASE } }
      }
    >
      <span className="lender-card-glow" aria-hidden />
      <span className="lender-card-particles" aria-hidden>
        <span />
        <span />
      </span>

      <div className="lender-marketplace-card-inner flex h-full flex-col">
        <div className="lender-card-logo-block">
          <div
            className={cn(
              LENDER_CARD_LOGO_WELL_CLASS,
              `lender-card-logo-well-${lender.slug}`
            )}
          >
            {badgeMeta ? (
              <span className={cn("lender-featured-ribbon", badgeMeta.className)}>
                {badgeMeta.label}
              </span>
            ) : null}
            <LenderLogo lender={lender} size={LENDER_LOGO_CARD_SIZE} fitTile />
          </div>
          <p
            className={cn(
              "lender-card-logo-category",
              `lender-category-text-${lender.category}`
            )}
          >
            {LENDER_CATEGORY_LABELS[lender.category]}
          </p>
        </div>

        <button
          type="button"
          className="lender-card-details-toggle"
          aria-expanded={detailsOpen}
          aria-controls={`lender-details-${lender.slug}`}
          onClick={toggleDetails}
        >
          <ul className="lender-stat-grid" aria-label={`${lender.name} loan highlights`}>
            {PRIMARY_STATS(lender).map(({ icon: Icon, label, value }) => (
              <li key={label} className="lender-stat-cell">
                <Icon className="mx-auto h-3.5 w-3.5 text-primary" aria-hidden />
                <span className="lender-stat-label">{label}</span>
                <span className="lender-stat-value" title={value}>
                  {value}
                </span>
              </li>
            ))}
          </ul>
          <span className="lender-card-details-toggle-hint">
            <span>{detailsOpen ? "Hide details" : "View details"}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-300",
                detailsOpen && "rotate-180"
              )}
              aria-hidden
            />
          </span>
        </button>

        <div
          id={`lender-details-${lender.slug}`}
          className="lender-card-details-hover"
          aria-hidden={!detailsOpen}
        >
          <ul className="lender-details-list">
            <li className="lender-details-row">
              <Shield className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              <span className="text-[11px] text-muted-foreground">Collateral</span>
              <span className="ml-auto text-[11px] font-semibold text-secondary">
                {lender.unsecured ? "No collateral" : "May be required"}
              </span>
            </li>
            <li className="lender-details-row">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              <span className="text-[11px] text-muted-foreground">Lakshya fee</span>
              <span className="ml-auto text-[11px] font-semibold text-secondary">
                Zero service charge
              </span>
            </li>
            <li className="lender-details-row">
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              <span className="text-[11px] text-muted-foreground">Eligibility</span>
              <span className="ml-auto text-[11px] font-semibold text-secondary">
                Study abroad profiles
              </span>
            </li>
          </ul>
        </div>

        <div className="lender-card-actions mt-auto">
          <EligibilityCta
            source={`lending-partners-${lender.slug}`}
            preferredLender={lender.name}
            className="lender-card-cta group/btn"
            aria-label={`Apply through ${lender.name}`}
          >
            <span>Apply</span>
            <ArrowRight
              className="lender-card-cta-arrow h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5"
              aria-hidden
            />
          </EligibilityCta>
          <button
            type="button"
            className={cn(
              "lender-card-compare-btn",
              isCompareSelected && "lender-card-compare-btn-active"
            )}
            aria-pressed={isCompareSelected}
            aria-label={
              isCompareSelected
                ? `Remove ${lender.name} from comparison`
                : `Add ${lender.name} to comparison`
            }
            disabled={compareDisabled}
            onClick={onToggleCompare}
          >
            {isCompareSelected ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden />
                Added
              </>
            ) : (
              "Compare"
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export const LenderPartnerCard = memo(LenderPartnerCardInner);

"use client";

import { motion } from "framer-motion";
import {
  LENDER_CATEGORY_LABELS,
  LENDER_CATEGORY_ORDER,
} from "@/lib/constants/marketing/lenders";
import type { LenderCategory } from "@/types/marketing";
import { cn } from "@/lib/utils";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

export type LenderFilter = "all" | LenderCategory;

interface LendingPartnersFilterProps {
  value: LenderFilter;
  onChange: (value: LenderFilter) => void;
}

const FILTERS: { value: LenderFilter; label: string }[] = [
  { value: "all", label: "All Lenders" },
  ...LENDER_CATEGORY_ORDER.map((category) => ({
    value: category,
    label: LENDER_CATEGORY_LABELS[category],
  })),
];

export function LendingPartnersFilter({ value, onChange }: LendingPartnersFilterProps) {
  const { prefersReducedMotion } = useMarketingMotion();

  return (
    <div className="lender-filter-sticky">
      <div
        className="lender-segmented-control"
        role="tablist"
        aria-label="Filter lending partners by category"
      >
        {FILTERS.map((item) => {
          const active = value === item.value;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(item.value)}
              className={cn(
                "lender-segmented-tab",
                active && "lender-segmented-tab-active"
              )}
            >
              {active && !prefersReducedMotion && (
                <motion.span
                  layoutId="lender-filter-indicator"
                  className="lender-segmented-indicator"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  aria-hidden
                />
              )}
              {active && prefersReducedMotion && (
                <span className="lender-segmented-indicator" aria-hidden />
              )}
              <span className="relative z-[1]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

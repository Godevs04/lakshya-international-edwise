"use client";

import { useCallback, useMemo, useState } from "react";
import { MARKETING_LENDERS } from "@/lib/constants/marketing/lenders";
import { LendingPartnersFilter, type LenderFilter } from "@/components/marketing/lenders/lending-partners-filter";
import { LenderPartnerCard } from "@/components/marketing/lenders/lender-partner-card";
import { LendingPartnersEmptyState } from "@/components/marketing/lenders/lending-partners-empty-state";
import { LenderCompareBar } from "@/components/marketing/lenders/lender-compare-bar";
import { LenderCompareDrawer } from "@/components/marketing/lenders/lender-compare-drawer";

const MAX_COMPARE = 3;

export function LendingPartnersExplorer() {
  const [filter, setFilter] = useState<LenderFilter>("all");
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const lenders = useMemo(
    () =>
      filter === "all"
        ? MARKETING_LENDERS
        : MARKETING_LENDERS.filter((l) => l.category === filter),
    [filter]
  );

  const compareLenders = useMemo(
    () =>
      compareSlugs
        .map((slug) => MARKETING_LENDERS.find((l) => l.slug === slug))
        .filter(Boolean) as typeof MARKETING_LENDERS,
    [compareSlugs]
  );

  const toggleCompare = useCallback((slug: string) => {
    setCompareSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, slug];
    });
  }, []);

  const removeCompare = useCallback((slug: string) => {
    setCompareSlugs((prev) => prev.filter((s) => s !== slug));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareSlugs([]);
    setDrawerOpen(false);
  }, []);

  return (
    <div id="lender-marketplace" className="lender-marketplace">
      <LendingPartnersFilter value={filter} onChange={setFilter} />

      <div className="lender-section-divider" aria-hidden />

      {lenders.length === 0 ? (
        <LendingPartnersEmptyState />
      ) : (
        <div
          className="lender-marketplace-grid"
          role="tabpanel"
          aria-label={
            filter === "all"
              ? "All lending partners"
              : `Lending partners filtered by ${filter}`
          }
        >
          {lenders.map((lender, index) => (
            <LenderPartnerCard
              key={lender.slug}
              lender={lender}
              index={index}
              isCompareSelected={compareSlugs.includes(lender.slug)}
              compareDisabled={
                compareSlugs.length >= MAX_COMPARE && !compareSlugs.includes(lender.slug)
              }
              onToggleCompare={() => toggleCompare(lender.slug)}
            />
          ))}
        </div>
      )}

      <LenderCompareBar
        lenders={compareLenders}
        maxCount={MAX_COMPARE}
        onRemove={removeCompare}
        onClear={clearCompare}
        onCompare={() => setDrawerOpen(true)}
      />

      <LenderCompareDrawer
        lenders={compareLenders}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

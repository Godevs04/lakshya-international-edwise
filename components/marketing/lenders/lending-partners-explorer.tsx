"use client";

import { useState } from "react";
import { LenderLogo } from "@/components/marketing/lenders/lender-logo";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import {
  MARKETING_LENDERS,
  LENDER_CATEGORY_LABELS,
  LENDER_CATEGORY_ORDER,
} from "@/lib/constants/marketing/lenders";
import type { LenderCategory } from "@/types/marketing";
import { cn } from "@/lib/utils";
import { TrendingUp, Wallet, Clock } from "lucide-react";

type Filter = "all" | LenderCategory;

export function LendingPartnersExplorer() {
  const [filter, setFilter] = useState<Filter>("all");

  const lenders =
    filter === "all"
      ? MARKETING_LENDERS
      : MARKETING_LENDERS.filter((l) => l.category === filter);

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: "All Lenders" },
    ...LENDER_CATEGORY_ORDER.map((category) => ({
      value: category,
      label: LENDER_CATEGORY_LABELS[category],
    })),
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === item.value
                ? "bg-primary text-white"
                : "border border-border bg-white text-secondary/80 hover:border-primary/40 hover:text-primary"
            )}
            aria-pressed={filter === item.value}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {lenders.map((lender) => (
          <div key={lender.slug} className="card-premium flex flex-col p-6">
            <div className="flex h-12 items-center">
              <LenderLogo lender={lender} className="h-8" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-primary">
                {LENDER_CATEGORY_LABELS[lender.category]}
              </span>
              {lender.unsecured && (
                <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                  No collateral
                </span>
              )}
            </div>
            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                <dt className="sr-only">Interest from</dt>
                <dd>ROI from {lender.roiFrom}%</dd>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="h-4 w-4 text-primary" />
                <dt className="sr-only">Max loan</dt>
                <dd>{lender.maxLoanLabel}</dd>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <dt className="sr-only">Processing time</dt>
                <dd>{lender.processingLabel}</dd>
              </div>
            </dl>
            <EligibilityCta
              source={`lending-partners-${lender.slug}`}
              preferredLender={lender.name}
              className="mt-6 w-full py-2.5 text-sm"
            >
              Apply through this lender
            </EligibilityCta>
          </div>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { LenderLogo } from "@/components/marketing/lenders/lender-logo";
import {
  MARKETING_LENDERS,
  LENDER_CATEGORY_LABELS,
  LENDER_CATEGORY_ORDER,
} from "@/lib/constants/marketing/lenders";
import { ArrowRight } from "lucide-react";

export function LendingPartnersPreview() {
  return (
    <SectionShell
      variant="white"
      background="map"
      journeyNode="lenders"
      eyebrow="Lending Partners"
      title="Banks, NBFCs & international lenders — all in one place"
      description="Government banks for the lowest rates, NBFCs for speed and flexibility, and international lenders for no-collateral funding."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LENDER_CATEGORY_ORDER.map((category) => {
          const lenders = MARKETING_LENDERS.filter((l) => l.category === category).slice(0, 4);
          const sample = lenders[0];
          return (
            <div
              key={category}
              className="card-premium group p-5 transition-all hover:shadow-lg hover:ring-1 hover:ring-primary/10"
            >
              <p className="text-sm font-semibold text-foreground">
                {LENDER_CATEGORY_LABELS[category]}
              </p>
              {sample && (
                <div className="mt-2 space-y-1 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  <p>ROI from {sample.roiFrom}%</p>
                  <p>{sample.processingLabel} · {sample.maxLoanLabel}</p>
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {lenders.map((lender) => (
                  <div
                    key={lender.slug}
                    className="flex h-14 items-center justify-center rounded-xl border border-border/60 bg-white px-3 shadow-sm ring-1 ring-black/[0.03] transition-transform group-hover:scale-[1.02]"
                    title={lender.name}
                  >
                    <LenderLogo lender={lender} size="md" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/lending-partners"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Compare all lending partners
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </SectionShell>
  );
}

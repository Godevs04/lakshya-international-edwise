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
      eyebrow="Lending Partners"
      title="Banks, NBFCs & international lenders — all in one place"
      description="Government banks for the lowest rates, NBFCs for speed and flexibility, and international lenders for no-collateral funding."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LENDER_CATEGORY_ORDER.map((category) => {
          const lenders = MARKETING_LENDERS.filter((l) => l.category === category).slice(0, 4);
          return (
            <div key={category} className="card-premium p-5">
              <p className="text-sm font-semibold text-foreground">
                {LENDER_CATEGORY_LABELS[category]}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {lenders.map((lender) => (
                  <div
                    key={lender.slug}
                    className="flex h-14 items-center justify-center rounded-xl border border-border/60 bg-white px-3 shadow-sm ring-1 ring-black/[0.03]"
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

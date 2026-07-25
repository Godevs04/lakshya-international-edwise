"use client";

import dynamic from "next/dynamic";

const LoanCalculatorSection = dynamic(
  () =>
    import("@/components/marketing/sections/loan-calculator-section").then(
      (mod) => mod.LoanCalculatorSection
    ),
  { ssr: false, loading: () => <div className="min-h-[28rem]" aria-hidden /> }
);

/** Client boundary so homepage (RSC) can defer the calculator without ssr:false in a Server Component. */
export function LoanCalculatorSectionLazy() {
  return <LoanCalculatorSection />;
}

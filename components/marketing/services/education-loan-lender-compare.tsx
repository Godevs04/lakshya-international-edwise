"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";
import {
  LENDER_CATEGORY_LABELS,
  LENDER_CATEGORY_ORDER,
  MARKETING_LENDERS,
  getLenderCollateralLabel,
} from "@/lib/constants/marketing/lenders";
import type { LenderCategory, MarketingLender } from "@/types/marketing";
import {
  LenderLogo,
  LENDER_LOGO_PREVIEW_SIZE,
} from "@/components/marketing/lenders/lender-logo";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { cn } from "@/lib/utils";

type CompareFilter = "all" | LenderCategory;

const FILTERS: { value: CompareFilter; label: string }[] = [
  { value: "all", label: "All lenders" },
  ...LENDER_CATEGORY_ORDER.map((category) => ({
    value: category,
    label: LENDER_CATEGORY_LABELS[category],
  })),
];

const CATEGORY_BLURBS: Record<LenderCategory, string> = {
  government:
    "Public-sector banks usually offer the lowest interest rates when eligible collateral is available — ideal for cost-conscious families.",
  private:
    "Private banks balance competitive rates with faster processing and flexible collateral policies for strong co-applicant profiles.",
  nbfc: "NBFCs specialise in education finance with quicker decisions and stronger non-collateral options for premier university admits.",
  international:
    "International lenders fund selected universities without an Indian guarantor or property — profile and career outcomes matter most.",
};

function formatRoi(lender: MarketingLender): string {
  return `From ${lender.roiFrom}%`;
}

export function EducationLoanLenderCompare() {
  const [filter, setFilter] = useState<CompareFilter>("all");

  const lenders = useMemo(() => {
    if (filter === "all") return MARKETING_LENDERS;
    return MARKETING_LENDERS.filter((lender) => lender.category === filter);
  }, [filter]);

  return (
    <div id="compare-lenders" className="loan-lender-compare scroll-mt-28">
      <div className="loan-lender-compare-intro">
        <div className="loan-lender-compare-intro-copy">
          <span className="loan-lender-compare-eyebrow">
            <Scale className="h-3.5 w-3.5" aria-hidden />
            Lender comparison
          </span>
          <h3 className="loan-lender-compare-title">Compare popular lenders side by side</h3>
          <p>
            Explore ROI, loan amount, approval speed, and collateral needs across government banks,
            private banks, NBFCs, and international partners — then check your best match with
            Lakshya.
          </p>
        </div>
        <Link href="/lending-partners" className="loan-lender-compare-partners-link">
          Full partner directory
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div
        className="loan-lender-tabs"
        role="tablist"
        aria-label="Filter lenders by category"
      >
        {FILTERS.map((item) => {
          const active = filter === item.value;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(item.value)}
              className={cn("loan-lender-tab", active && "loan-lender-tab-active")}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {filter !== "all" ? (
        <p className="loan-lender-category-blurb">{CATEGORY_BLURBS[filter]}</p>
      ) : (
        <ul className="loan-lender-category-grid" aria-label="Lender categories at a glance">
          {LENDER_CATEGORY_ORDER.map((category) => (
            <li key={category}>
              <button
                type="button"
                className="loan-lender-category-card"
                onClick={() => setFilter(category)}
              >
                <span>{LENDER_CATEGORY_LABELS[category]}</span>
                <span>
                  {MARKETING_LENDERS.filter((lender) => lender.category === category).length}{" "}
                  partners
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="loan-lender-table-wrap">
        <table className="loan-lender-table">
          <caption className="sr-only">
            Education loan lender comparison for studying abroad
          </caption>
          <thead>
            <tr>
              <th scope="col">Lender</th>
              <th scope="col">ROI</th>
              <th scope="col">Max loan</th>
              <th scope="col">Approval</th>
              <th scope="col">Collateral</th>
              <th scope="col">
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lenders.map((lender) => {
              const collateral = getLenderCollateralLabel(lender);
              const collateralKey = collateral.toLowerCase();
              return (
                <tr key={lender.slug}>
                  <th scope="row">
                    <div className="loan-lender-name-cell">
                      <span className="loan-lender-logo-tile">
                        <LenderLogo
                          lender={lender}
                          size={LENDER_LOGO_PREVIEW_SIZE}
                          fitTile
                          className="loan-lender-logo-img"
                          imageSizes="96px"
                        />
                      </span>
                      <div>
                        <span className="loan-lender-name">{lender.name}</span>
                        <span className="loan-lender-category">
                          {LENDER_CATEGORY_LABELS[lender.category]}
                        </span>
                      </div>
                    </div>
                  </th>
                  <td>
                    <span className="loan-lender-roi">{formatRoi(lender)}</span>
                  </td>
                  <td>{lender.maxLoanLabel}</td>
                  <td>{lender.processingLabel}</td>
                  <td>
                    <span
                      className={cn(
                        "loan-lender-collateral",
                        collateralKey.includes("no collateral") && "loan-lender-collateral-none",
                        collateralKey.includes("not mandatory") &&
                          "loan-lender-collateral-optional",
                        collateralKey.includes("mandatory") && "loan-lender-collateral-required"
                      )}
                    >
                      {collateral}
                    </span>
                  </td>
                  <td>
                    <EligibilityCta
                      source={`education-loan-compare-${lender.slug}`}
                      preferredLender={lender.name}
                      className="loan-lender-row-cta"
                    >
                      Check
                    </EligibilityCta>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="loan-lender-disclaimer">
        Rates and limits are indicative and vary by profile, university, co-applicant income, and
        lender policy. Lakshya charges zero service fee to students.
      </p>
    </div>
  );
}

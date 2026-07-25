"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import {
  EDUCATION_LOAN_TYPE_DETAILS,
  type EducationLoanTypeDetail,
} from "@/lib/constants/marketing/education-loan-options";
import type { CountryLoanTypeNote } from "@/lib/constants/marketing/country-loan-guides";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { cn } from "@/lib/utils";

interface CountryLoanTypesSectionProps {
  countryName: string;
  slug: string;
  loanTypes: CountryLoanTypeNote[];
}

function resolveType(slug: string): EducationLoanTypeDetail | undefined {
  return EDUCATION_LOAN_TYPE_DETAILS.find((entry) => entry.slug === slug);
}

export function CountryLoanTypesSection({
  countryName,
  slug,
  loanTypes,
}: CountryLoanTypesSectionProps) {
  const resolved = useMemo(
    () =>
      loanTypes
        .map((note) => {
          const detail = resolveType(note.slug);
          if (!detail) return null;
          return { note, detail };
        })
        .filter(Boolean) as { note: CountryLoanTypeNote; detail: EducationLoanTypeDetail }[],
    [loanTypes]
  );

  const [activeSlug, setActiveSlug] = useState(resolved[0]?.detail.slug ?? "collateral");
  const active = resolved.find((entry) => entry.detail.slug === activeSlug) ?? resolved[0];

  if (!active) return null;

  const { note, detail } = active;

  return (
    <div id="loan-types" className="country-loan-types scroll-mt-28">
      <div className="country-loan-types-head">
        <p className="country-loan-types-eyebrow">Detailed guide</p>
        <h2>Types of education loans for {countryName}</h2>
        <p>
          Each loan type has its own information and document checklist. Select a type below —
          collateral, non-collateral, and without-guarantor are never mixed into one generic list.
        </p>
      </div>

      <div
        className="country-loan-type-tabs"
        role="tablist"
        aria-label={`${countryName} education loan types`}
      >
        {resolved.map(({ detail: type }) => {
          const selected = type.slug === active.detail.slug;
          return (
            <button
              key={type.slug}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`loan-type-tab-${type.slug}`}
              aria-controls={`loan-type-panel-${type.slug}`}
              onClick={() => setActiveSlug(type.slug)}
              className={cn("country-loan-type-tab", selected && "country-loan-type-tab-active")}
            >
              <MarketingIcon name={type.icon} className="h-4 w-4" />
              <span>{type.title}</span>
            </button>
          );
        })}
      </div>

      <article
        id={`loan-type-panel-${detail.slug}`}
        role="tabpanel"
        aria-labelledby={`loan-type-tab-${detail.slug}`}
        className="country-loan-type-panel"
      >
        <div className="country-loan-type-panel-grid">
          <div>
            <span className="country-loan-type-badge">{detail.eyebrow}</span>
            <h3>{detail.headline}</h3>
            <p className="country-loan-type-country-note">{note.summary}</p>
            <div className="country-loan-type-summary">
              {detail.summary.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <EligibilityCta
              source={`country-${slug}-loan-type-${detail.slug}`}
              targetCountry={countryName}
              className="mt-6 px-5 py-2.5 text-sm"
            >
              Check {detail.title} eligibility
            </EligibilityCta>
          </div>

          <aside className="country-loan-type-aside">
            <h4>Why choose this loan</h4>
            <ul>
              {detail.benefits.slice(0, 6).map((benefit) => (
                <li key={benefit}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="country-loan-type-checklist">
          <div className="country-loan-type-checklist-head">
            <ClipboardList className="h-5 w-5 text-primary" aria-hidden />
            <div>
              <h4>{detail.title} — Document checklist</h4>
              <p>
                Documents required specifically for a {detail.title.toLowerCase()} for {countryName}.
                This list is not shared with other loan types.
              </p>
            </div>
          </div>
          <div className="country-loan-type-checklist-grid">
            {detail.checklist.map((group) => (
              <div key={group.title} className="country-loan-type-checklist-card">
                <h5>{group.title}</h5>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}

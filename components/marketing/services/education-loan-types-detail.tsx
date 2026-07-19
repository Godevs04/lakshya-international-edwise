"use client";

import Link from "next/link";
import { CheckCircle2, ClipboardList, MapPin, Scale } from "lucide-react";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import {
  EDUCATION_LOAN_TYPE_DETAILS,
  type EducationLoanTypeDetail,
} from "@/lib/constants/marketing/education-loan-options";
import { cn } from "@/lib/utils";

function LoanTypeNav() {
  return (
    <nav className="loan-type-nav" aria-label="Education loan types">
      {EDUCATION_LOAN_TYPE_DETAILS.map((loanType) => (
        <Link key={loanType.slug} href={`#${loanType.slug}`} className="loan-type-nav-link">
          <MarketingIcon name={loanType.icon} className="h-4 w-4" />
          <span>{loanType.title}</span>
        </Link>
      ))}
      <Link href="#compare-lenders" className="loan-type-nav-link">
        <Scale className="h-4 w-4" aria-hidden />
        <span>Compare lenders</span>
      </Link>
    </nav>
  );
}

function LoanTypeCard({ loanType }: { loanType: EducationLoanTypeDetail }) {
  return (
    <article id={loanType.slug} className="loan-type-detail scroll-mt-28">
      <div className="loan-type-detail-hero">
        <div className="loan-type-detail-copy">
          <span className="loan-type-detail-eyebrow">{loanType.eyebrow}</span>
          <div className="loan-type-detail-title-row">
            <span className="loan-type-detail-icon">
              <MarketingIcon name={loanType.icon} className="h-6 w-6" />
            </span>
            <h3 className="loan-type-detail-title">{loanType.headline}</h3>
          </div>
          <div className="loan-type-detail-summary">
            {loanType.summary.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <ul className="loan-type-detail-highlights">
            {loanType.highlights.map((item) => (
              <li key={item}>
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <EligibilityCta
            source={`education-loan-detail-${loanType.slug}`}
            className="mt-6 px-5 py-2.5 text-sm"
          />
        </div>

        <aside className="loan-type-detail-aside">
          <h4 className="loan-type-aside-title">Why choose this loan</h4>
          <ul className="loan-type-aside-list">
            {loanType.benefits.slice(0, 6).map((benefit) => (
              <li key={benefit}>
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          {loanType.destinations && loanType.destinations.length > 0 ? (
            <div className="loan-type-destinations">
              <p className="loan-type-aside-title">
                <MapPin className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
                Destinations
              </p>
              <div className="loan-type-destination-chips">
                {loanType.destinations.map((destination) => (
                  <span key={destination}>{destination}</span>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      <div className="loan-type-benefits-grid">
        <h4>Key advantages</h4>
        <ul>
          {loanType.benefits.map((benefit) => (
            <li key={benefit}>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="loan-type-checklist">
        <div className="loan-type-checklist-head">
          <ClipboardList className="h-5 w-5 text-primary" aria-hidden />
          <div>
            <h4>Document checklist</h4>
            <p>Prepare these documents before you start your {loanType.title.toLowerCase()} application.</p>
          </div>
        </div>
        <div className="loan-type-checklist-grid">
          {loanType.checklist.map((group) => (
            <div key={group.title} className="loan-type-checklist-card">
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

      <div className="loan-type-trust">
        <ul>
          {loanType.trustPoints.map((point) => (
            <li key={point}>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <p className="loan-type-closing">{loanType.closingLine}</p>
      </div>
    </article>
  );
}

export function EducationLoanTypesDetail() {
  return (
    <div className="loan-types-detail">
      <LoanTypeNav />
      <div className={cn("loan-types-detail-list")}>
        {EDUCATION_LOAN_TYPE_DETAILS.map((loanType) => (
          <LoanTypeCard key={loanType.slug} loanType={loanType} />
        ))}
      </div>
    </div>
  );
}

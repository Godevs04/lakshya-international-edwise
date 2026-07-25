import { Percent, BadgeIndianRupee, Wallet, FileSpreadsheet } from "lucide-react";
import type { CountryLoanMetrics } from "@/lib/constants/marketing/country-loan-guides";
import { COUNTRY_LOAN_DISCLAIMER } from "@/lib/constants/marketing/country-loan-guides";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import Link from "next/link";

interface CountryLoanMetricsBandProps {
  countryName: string;
  slug: string;
  metrics: CountryLoanMetrics;
}

const METRIC_ITEMS = [
  { key: "interestRates" as const, label: "Interest Rates", icon: Percent },
  { key: "serviceCharge" as const, label: "Service Charge", icon: BadgeIndianRupee },
  { key: "marginMoney" as const, label: "Margin Money", icon: Wallet },
  { key: "processingFee" as const, label: "Processing Fee (PF)", icon: FileSpreadsheet },
];

export function CountryLoanMetricsBand({
  countryName,
  slug,
  metrics,
}: CountryLoanMetricsBandProps) {
  return (
    <section className="country-loan-metrics" aria-labelledby={`country-loan-metrics-${slug}`}>
      <div className="country-loan-metrics-inner">
        <div className="country-loan-metrics-copy">
          <h2 id={`country-loan-metrics-${slug}`} className="country-loan-metrics-title">
            {countryName} Education Loan
          </h2>
          <p className="country-loan-metrics-sub">
            Get the best education loan to study in {countryName} with Lakshya International Edwise —
            transparent ROI, zero Lakshya service charge, and clear processing guidance.
          </p>
        </div>

        <ul className="country-loan-metrics-grid">
          {METRIC_ITEMS.map(({ key, label, icon: Icon }) => (
            <li key={key} className="country-loan-metric-item">
              <span className="country-loan-metric-icon" aria-hidden>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="country-loan-metric-label">{label}</p>
                <p className="country-loan-metric-value">{metrics[key]}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="country-loan-metrics-actions">
          <EligibilityCta
            source={`country-${slug}-metrics-eligibility`}
            targetCountry={countryName}
            className="country-loan-metrics-cta country-loan-metrics-cta-outline"
            variant="outline"
          >
            Check Eligibility
          </EligibilityCta>
          <EligibilityCta
            source={`country-${slug}-metrics-apply`}
            targetCountry={countryName}
            className="country-loan-metrics-cta country-loan-metrics-cta-solid"
          >
            Apply Now
          </EligibilityCta>
          <Link href="#loan-types" className="country-loan-metrics-anchor">
            View loan types &amp; checklists
          </Link>
        </div>

        <p className="country-loan-metrics-disclaimer">{COUNTRY_LOAN_DISCLAIMER}</p>
      </div>
    </section>
  );
}

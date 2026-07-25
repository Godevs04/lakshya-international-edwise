import { EDUCATION_LOAN_TYPE_DETAILS } from "@/lib/constants/marketing/education-loan-options";
import { HOW_IT_WORKS_STEPS, type ValueProp } from "@/lib/constants/marketing/lakshya-value-props";
import { MARKETING_LENDERS } from "@/lib/constants/marketing/lenders";

/** Epicred-style headline metrics shown on every country education-loan page. */
export interface CountryLoanMetrics {
  /** e.g. "Starting from 9.03%" */
  interestRates: string;
  /** Lakshya service charge — always free for students */
  serviceCharge: string;
  /** Indicative margin money / own contribution */
  marginMoney: string;
  /** Processing fee positioning (PF) */
  processingFee: string;
}

export interface CountryLoanTypeNote {
  slug: string;
  /** Short country-specific framing for this loan type */
  summary: string;
}

export interface CountryLoanGuide {
  metrics: CountryLoanMetrics;
  howItWorks: ValueProp[];
  /** Individual loan types available for this destination — never a shared generic blob */
  loanTypes: CountryLoanTypeNote[];
  /** Optional shortlist of lender slugs for the compare table */
  lenderSlugs?: string[];
  compareIntro: string;
}

const DEFAULT_METRICS: CountryLoanMetrics = {
  interestRates: "Starting from 8.25%",
  serviceCharge: "Free of cost",
  marginMoney: "0–15%*",
  processingFee: "Up to 50% off PF*",
};

const DEFAULT_HOW_IT_WORKS = HOW_IT_WORKS_STEPS;

function defaultLoanTypes(countryName: string): CountryLoanTypeNote[] {
  return EDUCATION_LOAN_TYPE_DETAILS.map((type) => {
    if (type.slug === "without-guarantor") {
      return {
        slug: type.slug,
        summary: `Without-guarantor options for ${countryName} focus on your university, course, and career outcomes — not a family co-signer.`,
      };
    }
    if (type.slug === "non-collateral") {
      return {
        slug: type.slug,
        summary: `Non-collateral loans for ${countryName} need an eligible co-applicant but no property pledge — compare banks and NBFCs on ROI and processing.`,
      };
    }
    return {
      slug: type.slug,
      summary: `Collateral loans for ${countryName} unlock higher limits and lower ROI when eligible property security is available — with a dedicated property document checklist.`,
    };
  });
}

function guide(
  countryName: string,
  partial: Partial<CountryLoanGuide> & { metrics?: Partial<CountryLoanMetrics> }
): CountryLoanGuide {
  return {
    metrics: { ...DEFAULT_METRICS, ...partial.metrics },
    howItWorks: partial.howItWorks ?? DEFAULT_HOW_IT_WORKS,
    loanTypes: partial.loanTypes ?? defaultLoanTypes(countryName),
    lenderSlugs: partial.lenderSlugs,
    compareIntro:
      partial.compareIntro ??
      `Compare ROI, processing timelines, and collateral needs for popular lenders that fund ${countryName} education loans.`,
  };
}

/**
 * Per-country loan product guides. Every destination gets individual metrics,
 * how-it-works, loan-type notes, and bank comparison — not one shared generic block.
 */
export const COUNTRY_LOAN_GUIDES: Record<string, CountryLoanGuide> = {
  uk: guide("the UK", {
    metrics: {
      interestRates: "Starting from 9.03%",
      serviceCharge: "Free of cost",
      marginMoney: "7%*",
      processingFee: "Up to 50% off PF*",
    },
    loanTypes: [
      {
        slug: "without-guarantor",
        summary:
          "International lenders such as Prodigy Finance and MPOWER can fund selected UK universities without an Indian guarantor — profile and admit strength matter most.",
      },
      {
        slug: "non-collateral",
        summary:
          "Indian banks and NBFCs fund UK programmes with an eligible co-applicant and no property mortgage — ideal when family income supports the file.",
      },
      {
        slug: "collateral",
        summary:
          "Secured UK education loans typically offer the lowest ROI and higher sanction amounts. Prepare the full property checklist below before valuation.",
      },
    ],
    lenderSlugs: [
      "sbi",
      "bank-of-baroda",
      "axis-bank",
      "credila",
      "avanse",
      "prodigy-finance",
      "mpower",
      "avanse-global",
    ],
    compareIntro:
      "UK education loan comparison — ROI, approval speed, and collateral policy across banks and international lenders.",
  }),
  usa: guide("the USA", {
    metrics: {
      interestRates: "Starting from 8.50%",
      serviceCharge: "Free of cost",
      marginMoney: "0–10%*",
      processingFee: "Up to 50% off PF*",
    },
    loanTypes: [
      {
        slug: "without-guarantor",
        summary:
          "MPOWER, Prodigy Finance, and select partners fund eligible US universities without a guarantor — strong admits and STEM/business outcomes help.",
      },
      {
        slug: "non-collateral",
        summary:
          "Unsecured USA loans via banks/NBFCs with a financially eligible co-applicant. No property pledge; full cost of attendance where policy allows.",
      },
      {
        slug: "collateral",
        summary:
          "Collateral-backed USA loans unlock higher limits and lower interest. Use the collateral-only document checklist for property papers.",
      },
    ],
    lenderSlugs: [
      "sbi",
      "bank-of-baroda",
      "union-bank",
      "axis-bank",
      "icici-bank",
      "credila",
      "avanse",
      "prodigy-finance",
      "mpower",
    ],
  }),
  canada: guide("Canada", {
    metrics: {
      interestRates: "Starting from 8.25%",
      serviceCharge: "Free of cost",
      marginMoney: "GIC + margin*",
      processingFee: "Up to 50% off PF*",
    },
    loanTypes: [
      {
        slug: "without-guarantor",
        summary:
          "Selected international options may fund Canada without a guarantor for eligible schools; GIC and proof of funds still apply for the study permit.",
      },
      {
        slug: "non-collateral",
        summary:
          "Non-collateral Canada loans pair well with SDS / GIC pathways when a co-applicant meets income norms — no property required.",
      },
      {
        slug: "collateral",
        summary:
          "Collateral loans for Canada often deliver the best ROI for families with eligible property. Checklist below covers student + property papers.",
      },
    ],
  }),
  ireland: guide("Ireland", {
    metrics: {
      interestRates: "Starting from 8.75%",
      serviceCharge: "Free of cost",
      marginMoney: "5–10%*",
      processingFee: "Up to 50% off PF*",
    },
  }),
  australia: guide("Australia", {
    metrics: {
      interestRates: "Starting from 8.90%",
      serviceCharge: "Free of cost",
      marginMoney: "5–15%*",
      processingFee: "Up to 50% off PF*",
    },
  }),
  germany: guide("Germany", {
    metrics: {
      interestRates: "Starting from 8.50%",
      serviceCharge: "Free of cost",
      marginMoney: "Blocked account + margin*",
      processingFee: "Up to 50% off PF*",
    },
    loanTypes: [
      {
        slug: "without-guarantor",
        summary:
          "Germany files often combine blocked-account planning with without-guarantor or profile-led lenders for eligible universities.",
      },
      {
        slug: "non-collateral",
        summary:
          "Non-collateral Germany loans need a co-applicant; we align sanction timing with blocked-account and visa financial proof.",
      },
      {
        slug: "collateral",
        summary:
          "Collateral Germany loans secure higher amounts at lower ROI. Follow the collateral document checklist for property verification.",
      },
    ],
  }),
  france: guide("France", {
    metrics: {
      interestRates: "Starting from 9.00%",
      serviceCharge: "Free of cost",
      marginMoney: "5–10%*",
      processingFee: "Up to 50% off PF*",
    },
  }),
  "new-zealand": guide("New Zealand", {
    metrics: {
      interestRates: "Starting from 9.00%",
      serviceCharge: "Free of cost",
      marginMoney: "5–15%*",
      processingFee: "Up to 50% off PF*",
    },
  }),
  dubai: guide("Dubai / UAE", {
    metrics: {
      interestRates: "Starting from 9.50%",
      serviceCharge: "Free of cost",
      marginMoney: "As per lender*",
      processingFee: "Up to 50% off PF*",
    },
  }),
  europe: guide("Europe", {
    metrics: {
      interestRates: "Starting from 8.50%",
      serviceCharge: "Free of cost",
      marginMoney: "Country-dependent*",
      processingFee: "Up to 50% off PF*",
    },
  }),
};

export function getCountryLoanGuide(slug: string, countryName: string): CountryLoanGuide {
  return COUNTRY_LOAN_GUIDES[slug] ?? guide(countryName, {});
}

export function getCountryCompareLenders(slug: string, countryName: string) {
  const loanGuide = getCountryLoanGuide(slug, countryName);
  if (!loanGuide.lenderSlugs?.length) return MARKETING_LENDERS;
  const selected = loanGuide.lenderSlugs.flatMap((lenderSlug) => {
    const lender = MARKETING_LENDERS.find((entry) => entry.slug === lenderSlug);
    return lender ? [lender] : [];
  });
  return selected.length > 0 ? selected : MARKETING_LENDERS;
}

export const COUNTRY_LOAN_DISCLAIMER =
  "*Indicative figures based on partner lender policies. Final ROI, margin money, and processing fees depend on the lender, profile, and university. Lakshya International Edwise charges zero service fee to students.";

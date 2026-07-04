import type { LenderCategory, MarketingLender } from "@/types/marketing";
import { LENDER_SEEDS } from "@/lib/constants/lenders";

const LOGO_BY_SLUG = new Map<string, Partial<MarketingLender>>(
  LENDER_SEEDS.map((lender) => [
    lender.slug,
    {
      logo: lender.logo,
      logoWidth: lender.logoWidth,
      logoHeight: lender.logoHeight,
      logoDisplayHeight: lender.logoDisplayHeight,
      logoMaxWidth: lender.logoMaxWidth,
      accent: lender.accent,
    },
  ])
);

const EXTRA_LOGOS: Record<string, Partial<MarketingLender>> = {
  "avanse-global": {
    logo: "/lenders/images/Avanse.png",
    logoWidth: 600,
    logoHeight: 400,
    logoDisplayHeight: 48,
    logoMaxWidth: 124,
    accent: "#00a651",
  },
};

function withLogo(lender: MarketingLender): MarketingLender {
  const brand = LOGO_BY_SLUG.get(lender.slug) ?? EXTRA_LOGOS[lender.slug];
  return brand ? { ...lender, ...brand } : lender;
}

const RAW_LENDERS: MarketingLender[] = [
  {
    name: "SBI",
    slug: "sbi",
    category: "government",
    roiFrom: 8.05,
    maxLoanLabel: "Up to ₹1.5 Cr",
    processingLabel: "7-10 days",
    accent: "#22409a",
  },
  {
    name: "Bank of Baroda",
    slug: "bank-of-baroda",
    category: "government",
    roiFrom: 8.15,
    maxLoanLabel: "Up to ₹1.5 Cr",
    processingLabel: "7-10 days",
    accent: "#f37021",
  },
  {
    name: "Union Bank",
    slug: "union-bank",
    category: "government",
    roiFrom: 8.3,
    maxLoanLabel: "Up to ₹1.5 Cr",
    processingLabel: "7-12 days",
    accent: "#c8102e",
  },
  {
    name: "PNB",
    slug: "pnb",
    category: "government",
    roiFrom: 8.4,
    maxLoanLabel: "Up to ₹1.5 Cr",
    processingLabel: "7-12 days",
    accent: "#a6192e",
  },
  {
    name: "Axis Bank",
    slug: "axis-bank",
    category: "private",
    roiFrom: 9.5,
    maxLoanLabel: "Up to ₹75 L",
    processingLabel: "3-5 days",
    unsecured: true,
    accent: "#97144d",
  },
  {
    name: "ICICI Bank",
    slug: "icici-bank",
    category: "private",
    roiFrom: 9.75,
    maxLoanLabel: "Up to ₹1 Cr",
    processingLabel: "3-5 days",
    unsecured: true,
    accent: "#b02a30",
  },
  {
    name: "IDFC First",
    slug: "idfc-first",
    category: "private",
    roiFrom: 9.9,
    maxLoanLabel: "Up to ₹75 L",
    processingLabel: "3-5 days",
    unsecured: true,
    accent: "#9c1d26",
  },
  {
    name: "YES Bank",
    slug: "yes-bank",
    category: "private",
    roiFrom: 10.0,
    maxLoanLabel: "Up to ₹65 L",
    processingLabel: "3-6 days",
    unsecured: true,
    accent: "#00518f",
  },
  {
    name: "Credila",
    slug: "credila",
    category: "nbfc",
    roiFrom: 10.25,
    maxLoanLabel: "Up to ₹2 Cr",
    processingLabel: "73 hours",
    unsecured: true,
    featured: true,
  },
  {
    name: "Avanse",
    slug: "avanse",
    category: "nbfc",
    roiFrom: 10.5,
    maxLoanLabel: "Up to ₹2 Cr",
    processingLabel: "73 hours",
    unsecured: true,
    featured: true,
  },
  {
    name: "Auxilo",
    slug: "auxilo",
    category: "nbfc",
    roiFrom: 10.75,
    maxLoanLabel: "Up to ₹1.5 Cr",
    processingLabel: "3-5 days",
    unsecured: true,
  },
  {
    name: "InCred",
    slug: "incred",
    category: "nbfc",
    roiFrom: 11.0,
    maxLoanLabel: "Up to ₹1 Cr",
    processingLabel: "3-5 days",
    unsecured: true,
    featured: true,
  },
  {
    name: "Tata Capital",
    slug: "tata-capital",
    category: "nbfc",
    roiFrom: 10.99,
    maxLoanLabel: "Up to ₹75 L",
    processingLabel: "3-6 days",
    unsecured: true,
    accent: "#486aae",
  },
  {
    name: "Fintifi",
    slug: "fintifi",
    category: "nbfc",
    roiFrom: 11.25,
    maxLoanLabel: "Up to ₹65 L",
    processingLabel: "4-7 days",
    unsecured: true,
    accent: "#0ea5e9",
  },
  {
    name: "Prodigy Finance",
    slug: "prodigy-finance",
    category: "international",
    roiFrom: 9.5,
    maxLoanLabel: "Up to full cost",
    processingLabel: "5-8 days",
    unsecured: true,
    featured: true,
  },
  {
    name: "MPOWER",
    slug: "mpower",
    category: "international",
    roiFrom: 9.99,
    maxLoanLabel: "Up to $100K",
    processingLabel: "5-8 days",
    unsecured: true,
    accent: "#1b998b",
  },
  {
    name: "Avanse Global",
    slug: "avanse-global",
    category: "international",
    roiFrom: 10.5,
    maxLoanLabel: "Up to $85K",
    processingLabel: "5-8 days",
    unsecured: true,
    accent: "#00a651",
  },
  {
    name: "Leap Finance",
    slug: "leap-finance",
    category: "international",
    roiFrom: 11.0,
    maxLoanLabel: "Up to $80K",
    processingLabel: "5-8 days",
    unsecured: true,
    accent: "#7c3aed",
  },
];

export const MARKETING_LENDERS: MarketingLender[] = RAW_LENDERS.map(withLogo);

/** Curated mix for hero card — one strong pick per lender type, good logo contrast */
export const HERO_SHOWCASE_LENDER_SLUGS = [
  "sbi",
  "icici-bank",
  "credila",
  "prodigy-finance",
  "axis-bank",
  "mpower",
] as const;

export function getHeroShowcaseLenders(): MarketingLender[] {
  return HERO_SHOWCASE_LENDER_SLUGS.map(
    (slug) => MARKETING_LENDERS.find((lender) => lender.slug === slug)!
  ).filter(Boolean);
}

export const LENDER_CATEGORY_LABELS: Record<LenderCategory, string> = {
  government: "Government Banks",
  private: "Private Banks",
  nbfc: "NBFC Partners",
  international: "International Lenders",
};

export const LENDER_CATEGORY_ORDER: LenderCategory[] = [
  "government",
  "private",
  "nbfc",
  "international",
];

export function getLendersByCategory(category: LenderCategory): MarketingLender[] {
  return MARKETING_LENDERS.filter((lender) => lender.category === category);
}

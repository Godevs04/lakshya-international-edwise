import type { MarketingServiceSubOption } from "@/types/marketing";

export const EDUCATION_LOAN_OPTIONS: MarketingServiceSubOption[] = [
  {
    slug: "non-cosigner",
    title: "Non Cosigner Loan",
    shortDescription: "Fund your studies without a co-signer or guarantor.",
    icon: "Users",
  },
  {
    slug: "cosigner",
    title: "Cosigner Loan",
    shortDescription: "Lower rates with a qualified co-signer on your application.",
    icon: "HeartHandshake",
  },
  {
    slug: "non-collateral",
    title: "Non Collateral Loan",
    shortDescription: "Unsecured education loans — no property pledge required.",
    icon: "ShieldCheck",
  },
  {
    slug: "collateral",
    title: "Collateral Loan",
    shortDescription: "Secured loans with the lowest interest from top banks.",
    icon: "Building2",
  },
];

export function getEducationLoanOptionHref(slug: string): string {
  return `/services/education-loan#${slug}`;
}

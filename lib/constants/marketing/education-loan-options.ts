import type { MarketingServiceSubOption } from "@/types/marketing";

export const EDUCATION_LOAN_OPTIONS: MarketingServiceSubOption[] = [
  {
    slug: "without-guarantor",
    title: "Without Guarantor Loan",
    shortDescription: "Fund your studies without a financial guarantor — no repayment during school for eligible profiles.",
    icon: "Users",
  },
  {
    slug: "non-collateral",
    title: "Non Collateral Loan",
    shortDescription: "Unsecured education loans up to ₹1.5 Cr — no property pledge required.",
    icon: "ShieldCheck",
  },
  {
    slug: "collateral",
    title: "Collateral Loan",
    shortDescription: "Secured loans up to ₹2 Cr with the lowest interest from top banks.",
    icon: "Building2",
  },
];

export function getEducationLoanOptionHref(slug: string): string {
  return `/services/education-loan#${slug}`;
}

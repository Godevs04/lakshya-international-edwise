import type { MarketingService } from "@/types/marketing";
import { EDUCATION_LOAN_OPTIONS } from "@/lib/constants/marketing/education-loan-options";

export const MARKETING_SERVICES: MarketingService[] = [
  {
    slug: "education-loan",
    title: "Education Loan",
    shortDescription:
      "Overseas education loans up to ₹2 Cr from 20+ banks and NBFCs — collateral, non-collateral, and selected non-cosigner options.",
    description:
      "Lakshya International Edwise helps Indian students compare secured and unsecured overseas education loans across banks and NBFCs. Fund tuition, living costs, travel, and visa-related expenses for destinations including USA, UK, Canada, Ireland, Germany, Australia, and UAE/Dubai.",
    highlights: [
      "Non-collateral & non-cosigner options",
      "Up to ₹2 Cr, 100% cost coverage",
      "ROI starting from 8.25%",
    ],
    icon: "Landmark",
    subOptions: EDUCATION_LOAN_OPTIONS,
  },
  {
    slug: "accommodation",
    title: "Accommodation",
    shortDescription: "Verified student housing near your university abroad.",
    description:
      "Secure safe, budget-friendly housing near campus before you fly, with financing folded into your education loan where possible.",
    highlights: ["Verified housing options", "Budget & commute planning", "Financing support"],
    icon: "Home",
  },
  {
    slug: "blocked-account-gic",
    title: "Blocked Account & GIC",
    shortDescription: "Germany blocked accounts and Canada GIC for your visa.",
    description:
      "Meet visa financial requirements with a compliant blocked account for Germany or a Guaranteed Investment Certificate for Canada, set up quickly.",
    highlights: ["Germany visa-compliant", "Canada GIC setup", "Fast processing"],
    icon: "ShieldCheck",
  },
  {
    slug: "forex-transfers",
    title: "Forex & Transfers",
    shortDescription: "Competitive forex rates for tuition and living expenses.",
    description:
      "Transfer tuition and living expenses at competitive rates with compliant, transparent remittance support and forex cards.",
    highlights: ["Best-rate tuition transfers", "Forex cards", "Compliance guidance"],
    icon: "CircleDollarSign",
  },
  {
    slug: "test-preparation",
    title: "Test Preparation",
    shortDescription: "IELTS, TOEFL, GRE & GMAT coaching partners.",
    description:
      "Get connected to trusted coaching partners for IELTS, TOEFL, PTE, GRE, and GMAT so your scores strengthen your loan and admission profile.",
    highlights: ["IELTS / TOEFL / PTE", "GRE / GMAT", "Trusted coaching partners"],
    icon: "BookOpen",
  },
  {
    slug: "credit-cards",
    title: "Credit Cards",
    shortDescription: "Student credit cards to build your credit abroad.",
    description:
      "Access student-friendly credit cards to manage expenses and build a credit history from day one in your destination country.",
    highlights: ["Student-friendly cards", "Build credit early", "No local history needed"],
    icon: "CreditCard",
  },
];

export function getMarketingService(slug: string): MarketingService | undefined {
  return MARKETING_SERVICES.find((entry) => entry.slug === slug);
}

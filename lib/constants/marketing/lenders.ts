import { LENDER_SEEDS } from "@/lib/constants/lenders";

export const MARKETING_LENDERS = LENDER_SEEDS.map((lender) => ({
  name: lender.name,
  slug: lender.slug,
  logo: lender.logo,
  logoWidth: lender.logoWidth,
  logoHeight: lender.logoHeight,
  accent: lender.accent,
}));

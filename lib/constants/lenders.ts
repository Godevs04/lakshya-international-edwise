export const LENDER_SEEDS = [
  { name: "Credila", slug: "credila", logo: "/lenders/credila.svg", accent: "#004B8D" },
  { name: "Avanse", slug: "avanse", logo: "/lenders/avanse.svg", accent: "#00A651" },
  { name: "HDFC Credila", slug: "hdfc-credila", logo: "/lenders/hdfc-credila.svg", accent: "#004B8D" },
  { name: "Auxilo", slug: "auxilo", logo: "/lenders/auxilo.svg", accent: "#1E3A8A" },
  { name: "InCred", slug: "incred", logo: "/lenders/incred.svg", accent: "#F26A21" },
  { name: "Prodigy Finance", slug: "prodigy-finance", logo: "/lenders/prodigy-finance.svg", accent: "#5B2C86" },
] as const;

export type LenderSlug = (typeof LENDER_SEEDS)[number]["slug"];
export type LenderSeed = (typeof LENDER_SEEDS)[number];

export function getLenderBrand(slug?: string, name?: string): LenderSeed | undefined {
  const normalizedSlug = slug?.trim().toLowerCase();
  if (normalizedSlug) {
    const bySlug = LENDER_SEEDS.find((entry) => entry.slug === normalizedSlug);
    if (bySlug) return bySlug;
  }

  const normalizedName = name?.trim().toLowerCase();
  if (normalizedName) {
    return LENDER_SEEDS.find((entry) => entry.name.toLowerCase() === normalizedName);
  }

  return undefined;
}

export function findLenderSlugByName(name?: string): string | undefined {
  return getLenderBrand(undefined, name)?.slug;
}

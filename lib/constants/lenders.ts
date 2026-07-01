export const LENDER_SEEDS = [
  {
    name: "Credila",
    slug: "credila",
    logo: "/lenders/images/Credila.png",
    logoWidth: 1800,
    logoHeight: 600,
    accent: "#004B8D",
  },
  {
    name: "Avanse",
    slug: "avanse",
    logo: "/lenders/images/Avanse.png",
    logoWidth: 600,
    logoHeight: 400,
    accent: "#00A651",
  },
  {
    name: "Auxilo",
    slug: "auxilo",
    logo: "/lenders/images/Auxilo.png",
    logoWidth: 640,
    logoHeight: 227,
    accent: "#1E3A8A",
  },
  {
    name: "InCred",
    slug: "incred",
    logo: "/lenders/images/Incred.png",
    logoWidth: 300,
    logoHeight: 200,
    accent: "#F26A21",
  },
  {
    name: "Prodigy Finance",
    slug: "prodigy-finance",
    logo: "/lenders/images/Prodigy.png",
    logoWidth: 300,
    logoHeight: 200,
    accent: "#5B2C86",
  },
] as const;

/** Legacy slug — HDFC Credila is the same as Credila */
const LENDER_SLUG_ALIASES: Record<string, string> = {
  "hdfc-credila": "credila",
};

export function normalizeLenderSlug(slug?: string | null): string | undefined {
  if (!slug?.trim()) return undefined;
  const lower = slug.trim().toLowerCase();
  return LENDER_SLUG_ALIASES[lower] ?? lower;
}

export type LenderSlug = (typeof LENDER_SEEDS)[number]["slug"];
export type LenderSeed = (typeof LENDER_SEEDS)[number];

/** Wide bank logo — use horizontal artwork (e.g. 220×40 px, aspect ratio 11:2). */
export const LENDER_LOGO_ASPECT_HINT =
  "Recommended logo: 220×40 px (11:2 wide). PNG, WebP, or SVG with transparent background.";

export function getLenderBrand(slug?: string, name?: string): LenderSeed | undefined {
  const normalizedSlug = normalizeLenderSlug(slug);
  if (normalizedSlug) {
    const bySlug = LENDER_SEEDS.find((entry) => entry.slug === normalizedSlug);
    if (bySlug) return bySlug;
  }

  const normalizedName = name?.trim().toLowerCase();
  if (normalizedName) {
    if (normalizedName === "hdfc credila") {
      return LENDER_SEEDS.find((entry) => entry.slug === "credila");
    }
    return LENDER_SEEDS.find((entry) => entry.name.toLowerCase() === normalizedName);
  }

  return undefined;
}

export function slugifyLenderName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findLenderSlugByName(name?: string): string | undefined {
  return getLenderBrand(undefined, name)?.slug;
}

export function isLenderSeedSlug(slug?: string | null): boolean {
  if (!slug?.trim()) return false;
  const normalized = normalizeLenderSlug(slug);
  return Boolean(normalized && LENDER_SEEDS.some((entry) => entry.slug === normalized));
}

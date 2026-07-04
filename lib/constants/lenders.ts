export const LENDER_SEEDS = [
  {
    name: "SBI",
    slug: "sbi",
    logo: "/lenders/images/Sbi.png",
    logoWidth: 678,
    logoHeight: 452,
    logoDisplayHeight: 46,
    logoMaxWidth: 128,
    accent: "#22409a",
  },
  {
    name: "Bank of Baroda",
    slug: "bank-of-baroda",
    logo: "/lenders/images/Bob.png",
    logoWidth: 738,
    logoHeight: 414,
    logoDisplayHeight: 42,
    logoMaxWidth: 132,
    accent: "#f37021",
  },
  {
    name: "Union Bank",
    slug: "union-bank",
    logo: "/lenders/images/UnionBank.png",
    logoWidth: 512,
    logoHeight: 512,
    logoDisplayHeight: 52,
    logoMaxWidth: 104,
    accent: "#c8102e",
  },
  {
    name: "PNB",
    slug: "pnb",
    logo: "/lenders/images/Pnb.png",
    logoWidth: 900,
    logoHeight: 900,
    logoDisplayHeight: 52,
    logoMaxWidth: 104,
    accent: "#a6192e",
  },
  {
    name: "Axis Bank",
    slug: "axis-bank",
    logo: "/lenders/images/Axis.png",
    logoWidth: 800,
    logoHeight: 500,
    logoDisplayHeight: 40,
    logoMaxWidth: 172,
    accent: "#97144d",
  },
  {
    name: "ICICI Bank",
    slug: "icici-bank",
    logo: "/lenders/images/Icici.png",
    logoWidth: 512,
    logoHeight: 512,
    logoDisplayHeight: 52,
    logoMaxWidth: 104,
    accent: "#b02a30",
  },
  {
    name: "IDFC First",
    slug: "idfc-first",
    logo: "/lenders/images/Idfc.png",
    logoWidth: 900,
    logoHeight: 900,
    logoDisplayHeight: 52,
    logoMaxWidth: 104,
    accent: "#9c1d26",
  },
  {
    name: "YES Bank",
    slug: "yes-bank",
    logo: "/lenders/images/Yes.png",
    logoWidth: 800,
    logoHeight: 419,
    logoDisplayHeight: 38,
    logoMaxWidth: 152,
    accent: "#00518f",
  },
  {
    name: "Credila",
    slug: "credila",
    logo: "/lenders/images/Credila.png",
    logoWidth: 1800,
    logoHeight: 600,
    logoDisplayHeight: 28,
    logoMaxWidth: 108,
    accent: "#004B8D",
  },
  {
    name: "Avanse",
    slug: "avanse",
    logo: "/lenders/images/Avanse.png",
    logoWidth: 600,
    logoHeight: 400,
    logoDisplayHeight: 48,
    logoMaxWidth: 124,
    accent: "#00A651",
  },
  {
    name: "Auxilo",
    slug: "auxilo",
    logo: "/lenders/images/Auxilo.png",
    logoWidth: 640,
    logoHeight: 227,
    logoDisplayHeight: 30,
    logoMaxWidth: 120,
    accent: "#1E3A8A",
  },
  {
    name: "InCred",
    slug: "incred",
    logo: "/lenders/images/Incred.png",
    logoWidth: 300,
    logoHeight: 200,
    logoDisplayHeight: 46,
    logoMaxWidth: 120,
    accent: "#F26A21",
  },
  {
    name: "Tata Capital",
    slug: "tata-capital",
    logo: "/lenders/images/TataCaptital.png",
    logoWidth: 300,
    logoHeight: 120,
    logoDisplayHeight: 28,
    logoMaxWidth: 128,
    accent: "#486aae",
  },
  {
    name: "Fintifi",
    slug: "fintifi",
    logo: "/lenders/images/Fintifi.png",
    logoWidth: 1600,
    logoHeight: 566,
    logoDisplayHeight: 30,
    logoMaxWidth: 120,
    accent: "#0ea5e9",
  },
  {
    name: "Prodigy Finance",
    slug: "prodigy-finance",
    logo: "/lenders/images/Prodigy.png",
    logoWidth: 300,
    logoHeight: 200,
    logoDisplayHeight: 46,
    logoMaxWidth: 120,
    accent: "#5B2C86",
  },
  {
    name: "MPOWER",
    slug: "mpower",
    logo: "/lenders/images/Mpower.png",
    logoWidth: 690,
    logoHeight: 361,
    logoDisplayHeight: 38,
    logoMaxWidth: 148,
    accent: "#1b998b",
  },
  {
    name: "Leap Finance",
    slug: "leap-finance",
    logo: "/lenders/images/LeapFinance.png",
    logoWidth: 1200,
    logoHeight: 600,
    logoDisplayHeight: 30,
    logoMaxWidth: 120,
    accent: "#7c3aed",
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

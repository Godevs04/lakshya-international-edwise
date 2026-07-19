import type { Metadata } from "next";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";

export const DEFAULT_OG_IMAGE_PATH = "/logo_model.jpeg";

export const DEFAULT_MARKETING_KEYWORDS = [
  "Lakshya International Edwise",
  "Lakshya Edwise",
  "education loan India",
  "overseas education loan",
  "study abroad education loan",
  "education finance",
  "student loan for international students",
  "non collateral education loan",
  "education loan without guarantor",
  "fast education loan approval",
  "lowest education loan interest rate",
  "education loan for USA",
  "education loan for UK",
  "education loan for Canada",
  "education loan for Germany",
  "education loan for Ireland",
  "ireland education loan",
  "education loan for UAE",
  "education finance UAE",
  "student loan Dubai",
  "education loan in Dubai",
  "education loan NBFC",
  "100 percent education loan",
] as const;

function trim(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}

export function getAbsoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function getDefaultOgImageUrl(): string {
  return getAbsoluteUrl(DEFAULT_OG_IMAGE_PATH);
}

export type MarketingMetadataInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
  openGraphType?: "website" | "article";
  /** Prevents root title template from appending the brand twice. */
  absoluteTitle?: boolean;
};

export function buildMarketingMetadata(input: MarketingMetadataInput): Metadata {
  const contact = getMarketingContact();
  const metadataBase = getMetadataBase();
  const path = input.path ?? "/";
  const canonical = getAbsoluteUrl(path);
  const imageUrl = input.image ? getAbsoluteUrl(input.image) : getDefaultOgImageUrl();
  const googleVerification = trim(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION);
  const title = input.absoluteTitle
    ? { absolute: input.title }
    : input.title;

  const metadata: Metadata = {
    metadataBase,
    title,
    description: input.description,
    keywords: input.keywords ?? [...DEFAULT_MARKETING_KEYWORDS],
    alternates: {
      canonical,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: contact.companyName,
      locale: "en_IN",
      type: input.openGraphType ?? "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${contact.companyName} — overseas education loan experts`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [imageUrl],
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };

  if (googleVerification) {
    metadata.verification = { google: googleVerification };
  }

  return metadata;
}

export function buildMarketingLayoutMetadata(): Metadata {
  const contact = getMarketingContact();
  const defaultTitle = `${contact.companyName} | Overseas Education Loan Experts`;
  const metadata = buildMarketingMetadata({
    title: defaultTitle,
    description:
      "Lakshya International Edwise helps Indian students fund overseas education with education loans from 20+ banks and NBFCs. Non-collateral options, 73-hour processing, and destinations including USA, UK, Canada, Ireland, Germany, and UAE/Dubai.",
    path: "/",
  });

  return {
    ...metadata,
    title: {
      default: defaultTitle,
    } as Metadata["title"],
  };
}

import type { Metadata } from "next";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";

export const DEFAULT_OG_IMAGE_PATH = "/logo_model.jpeg";

export const DEFAULT_MARKETING_KEYWORDS = [
  "education loan India",
  "overseas education loan",
  "study abroad education loan",
  "non collateral education loan",
  "education loan without cosigner",
  "fast education loan approval",
  "lowest education loan interest rate",
  "education loan for USA",
  "education loan for UK",
  "education loan for Canada",
  "education loan for Germany",
  "Lakshya International Edwise",
  "education loan NBFC",
  "100 percent education loan",
  "zero processing fee education loan",
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
};

export function buildMarketingMetadata(input: MarketingMetadataInput): Metadata {
  const contact = getMarketingContact();
  const metadataBase = getMetadataBase();
  const path = input.path ?? "/";
  const canonical = getAbsoluteUrl(path);
  const imageUrl = input.image ? getAbsoluteUrl(input.image) : getDefaultOgImageUrl();
  const googleVerification = trim(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION);

  const metadata: Metadata = {
    metadataBase,
    title: input.title,
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
          alt: contact.companyName,
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
  return buildMarketingMetadata({
    title: `${contact.companyName} | Overseas Education Loan Experts`,
    description:
      "Fund your global education with the lowest-interest education loan from 20+ trusted lenders. Non-collateral options, 73-hour approvals, up to ₹2 Cr, 100% cost coverage.",
    path: "/",
  });
}

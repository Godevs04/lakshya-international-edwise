import { getPublicAuthUrl } from "@/lib/config/env";
import { getDefaultCompanySettings } from "@/lib/config/app-defaults";

function trim(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function getSiteUrl(): string {
  const fromEnv = trim(process.env.NEXT_PUBLIC_SITE_URL);
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return getPublicAuthUrl();
}

export function getMarketingContact() {
  const company = getDefaultCompanySettings();
  return {
    siteUrl: getSiteUrl(),
    phone: trim(process.env.NEXT_PUBLIC_CONTACT_PHONE) || company.phone,
    email: trim(process.env.NEXT_PUBLIC_CONTACT_EMAIL) || company.email,
    whatsapp: trim(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
    mapsEmbed: trim(process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL),
    enquiryNotifyEmail:
      trim(process.env.WEBSITE_ENQUIRY_NOTIFY_EMAIL) || company.email,
    companyName: company.name,
    social: {
      facebook: trim(process.env.NEXT_PUBLIC_FACEBOOK_URL),
      instagram: trim(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
      linkedin: trim(process.env.NEXT_PUBLIC_LINKEDIN_URL),
      youtube: trim(process.env.NEXT_PUBLIC_YOUTUBE_URL),
    },
  };
}

export function getWhatsAppLink(message?: string): string | null {
  const number = getMarketingContact().whatsapp.replace(/\D/g, "");
  if (!number) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${text}`;
}

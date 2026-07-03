import { getPublicAuthUrl } from "@/lib/config/env";
import { getDefaultCompanySettings } from "@/lib/config/app-defaults";
import {
  isProductionRuntime,
  normalizeSupportEmail,
  PRODUCTION_SITE_URL,
  PRODUCTION_SUPPORT_EMAIL,
} from "@/lib/config/site";
import { MARKETING_OFFICES } from "@/lib/constants/marketing/offices";
import {
  MARKETING_DEFAULT_PHONE_DISPLAY,
  MARKETING_DEFAULT_PHONE_E164,
  formatMarketingPhoneDisplay,
} from "@/lib/constants/marketing/contact";
import { parseGoogleMapsEmbedCenter, parseGoogleMapsEmbedUrl } from "@/lib/utils/google-maps-embed";

function trim(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function getSiteUrl(): string {
  const fromEnv = trim(process.env.NEXT_PUBLIC_SITE_URL);
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  const authUrl = getPublicAuthUrl();
  if (isProductionRuntime() && authUrl.includes("localhost")) {
    return PRODUCTION_SITE_URL;
  }
  return authUrl;
}

export function getMarketingContact() {
  const company = getDefaultCompanySettings();
  const defaultEmail = normalizeSupportEmail(
    trim(process.env.NEXT_PUBLIC_CONTACT_EMAIL) ||
      company.email ||
      (isProductionRuntime() ? PRODUCTION_SUPPORT_EMAIL : "")
  );
  const office = MARKETING_OFFICES[0];
  const rawPhone =
    trim(process.env.NEXT_PUBLIC_CONTACT_PHONE) ||
    company.phone ||
    office?.phone ||
    MARKETING_DEFAULT_PHONE_DISPLAY;
  const rawWhatsapp =
    trim(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) || MARKETING_DEFAULT_PHONE_E164;

  return {
    siteUrl: getSiteUrl(),
    phone: formatMarketingPhoneDisplay(rawPhone),
    email: defaultEmail,
    whatsapp: rawWhatsapp,
    mapsEmbed: parseGoogleMapsEmbedUrl(process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL),
    mapCenter: parseGoogleMapsEmbedCenter(process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL),
    address: trim(process.env.APP_COMPANY_ADDRESS) || office?.address,
    officeName: office?.name ?? company.name,
    officeHours: office?.hours,
    enquiryNotifyEmail: normalizeSupportEmail(
      trim(process.env.WEBSITE_ENQUIRY_NOTIFY_EMAIL) || defaultEmail
    ),
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

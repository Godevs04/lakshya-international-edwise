export const PRODUCTION_SITE_URL = "https://lakshyainternationaledwise.com";
export const PRODUCTION_SUPPORT_EMAIL = "support@lakshyainternationaledwise.com";
export const PRODUCTION_COMPANY_NAME = "Lakshya International Edwise";
export const PRODUCTION_SITE_HOST = "lakshyainternationaledwise.com";
export const PRODUCTION_WWW_HOST = `www.${PRODUCTION_SITE_HOST}`;

const LEGACY_SUPPORT_EMAILS = new Set([
  "hello@teamgodevs.in",
  "hello@lakshyainternationaledwise.com",
]);

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isLegacySupportEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return LEGACY_SUPPORT_EMAILS.has(normalized) || normalized.endsWith("@teamgodevs.in");
}

/** Maps retired support addresses to the canonical production mailbox. */
export function normalizeSupportEmail(email: string | undefined | null): string {
  const trimmed = email?.trim() ?? "";
  if (!trimmed) {
    return isProductionRuntime() ? PRODUCTION_SUPPORT_EMAIL : "";
  }
  if (isLegacySupportEmail(trimmed)) {
    return PRODUCTION_SUPPORT_EMAIL;
  }
  return trimmed;
}

/** Normalizes the email inside `Name <email@domain>` SMTP from headers. */
export function normalizeSmtpFromAddress(from: string | undefined | null): string {
  const trimmed = from?.trim() ?? "";
  if (!trimmed) return "";

  const match = trimmed.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    const name = match[1]?.trim().replace(/^"|"$/g, "") ?? "";
    const email = normalizeSupportEmail(match[2]);
    return name ? `${name} <${email}>` : email;
  }

  return normalizeSupportEmail(trimmed);
}

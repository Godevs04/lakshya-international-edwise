/** Default marketing phone — used when env vars are unset */
export const MARKETING_DEFAULT_PHONE_E164 = "919502180806";
export const MARKETING_DEFAULT_PHONE_DISPLAY = "+91 95021 80806";

export function formatMarketingPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone.trim();
}

export function toMarketingTelHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.length === 10 ? `91${digits}` : digits;
  return `tel:+${normalized}`;
}

export function toMarketingWhatsAppDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

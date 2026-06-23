import {
  getStudentWhatsAppNumber,
  normalizeIndianMobileDigits,
} from "@/lib/utils/student-contact";

export { getStudentWhatsAppNumber };

export function buildWhatsAppUrl(phone: string): string | null {
  const normalized = normalizeIndianMobileDigits(phone);
  return normalized ? `https://wa.me/${normalized}` : null;
}

/** Indian identity & contact field validation */

export const AADHAAR_DIGITS = 12;
export const PAN_LENGTH = 10;
export const INDIAN_PHONE_DIGITS = 10;
export const PINCODE_DIGITS = 6;

export const AADHAAR_REGEX = /^\d{12}$/;
export const PAN_REGEX = /^[A-Z]{5}\d{4}[A-Z]$/;
export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
export const PINCODE_REGEX = /^\d{6}$/;
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export function normalizeDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizeAadhaar(value: string): string {
  return normalizeDigits(value);
}

export function normalizePan(value: string): string {
  return value.toUpperCase().replace(/\s/g, "");
}

export function normalizeIndianPhone(value: string): string {
  const digits = normalizeDigits(value);
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  return digits;
}

export function formatAadhaarForEdit(value: string): string {
  const digits = normalizeAadhaar(value);
  if (digits.length !== AADHAAR_DIGITS) return digits;
  return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
}

export function isValidAadhaar(value: string): boolean {
  return AADHAAR_REGEX.test(normalizeAadhaar(value));
}

export function isValidPan(value: string): boolean {
  return PAN_REGEX.test(normalizePan(value));
}

export function isValidIndianPhone(value: string): boolean {
  return INDIAN_PHONE_REGEX.test(normalizeIndianPhone(value));
}

export function isValidPincode(value: string): boolean {
  return PINCODE_REGEX.test(normalizeDigits(value));
}

export function isValidIfsc(value: string): boolean {
  return IFSC_REGEX.test(value.toUpperCase().replace(/\s/g, ""));
}

export function normalizeIfsc(value: string): string {
  return value.toUpperCase().replace(/\s/g, "");
}

export function normalizePincode(value: string): string {
  return normalizeDigits(value);
}

export function isBlank(value: string | undefined): boolean {
  return !value?.trim();
}

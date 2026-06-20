import { decrypt, encrypt, maskSensitive } from "@/lib/utils/encryption";

const ENCRYPTED_PATTERN = /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i;

export function isEncryptedValue(value: string): boolean {
  return ENCRYPTED_PATTERN.test(value);
}

export function safeDecrypt(value?: string | null): string {
  if (!value) return "";
  if (!isEncryptedValue(value)) return value;
  try {
    return decrypt(value);
  } catch {
    return "";
  }
}

export function maskAadhaar(value?: string | null): string | undefined {
  const plain = safeDecrypt(value ?? "");
  if (!plain) return undefined;
  const digits = plain.replace(/\D/g, "");
  if (digits.length < 4) return maskSensitive(plain);
  return `XXXX-XXXX-${digits.slice(-4)}`;
}

export function maskPan(value?: string | null): string | undefined {
  const plain = safeDecrypt(value ?? "");
  if (!plain) return undefined;
  if (plain.length <= 4) return maskSensitive(plain);
  return "*".repeat(plain.length - 4) + plain.slice(-4);
}

export function maskBankAccount(value?: string | null): string | undefined {
  const plain = safeDecrypt(value ?? "");
  if (!plain) return undefined;
  return maskSensitive(plain, 4);
}

export function isMaskedInput(value: string | undefined | null): boolean {
  if (!value) return true;
  return value.includes("*") || value.startsWith("XXXX");
}

export function encryptSensitiveField(
  value: string | undefined,
  existingEncrypted?: string
): string | undefined {
  if (!value || isMaskedInput(value)) return existingEncrypted;
  if (isEncryptedValue(value)) return value;
  return encrypt(value);
}

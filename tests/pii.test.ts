import { describe, it, expect } from "vitest";
import {
  isEncryptedValue,
  maskAadhaar,
  maskPan,
  maskBankAccount,
  isMaskedInput,
  encryptSensitiveField,
} from "@/lib/utils/pii";

describe("pii utils", () => {
  it("detects encrypted format", () => {
    expect(isEncryptedValue("abc123:def456:789abc")).toBe(true);
    expect(isEncryptedValue("plain-text")).toBe(false);
  });

  it("masks aadhaar last 4 digits", () => {
    expect(maskAadhaar("123456789012")).toBe("XXXX-XXXX-9012");
  });

  it("masks pan last 4 characters", () => {
    expect(maskPan("ABCDE1234F")).toBe("******234F");
  });

  it("masks bank account", () => {
    expect(maskBankAccount("1234567890")).toBe("******7890");
  });

  it("detects masked input", () => {
    expect(isMaskedInput("XXXX-XXXX-1234")).toBe(true);
    expect(isMaskedInput("****7890")).toBe(true);
    expect(isMaskedInput("")).toBe(true);
    expect(isMaskedInput("ABCDE1234F")).toBe(false);
  });

  it("skips re-encryption for masked values", () => {
    const existing = "existing:cipher:text";
    expect(encryptSensitiveField("XXXX-XXXX-1234", existing)).toBe(existing);
    expect(encryptSensitiveField("", existing)).toBe(existing);
  });
});

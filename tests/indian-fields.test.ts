import { describe, it, expect } from "vitest";
import {
  formatAadhaarForEdit,
  isValidAadhaar,
  isValidIndianPhone,
  isValidPan,
  isValidPincode,
  normalizeAadhaar,
  normalizeIndianPhone,
  normalizePan,
} from "@/lib/validations/indian-fields";

describe("indian-fields", () => {
  it("validates aadhaar as 12 digits only", () => {
    expect(isValidAadhaar("123456789012")).toBe(true);
    expect(isValidAadhaar("1234 5678 9012")).toBe(true);
    expect(isValidAadhaar("12345678901")).toBe(false);
    expect(isValidAadhaar("1234567890123")).toBe(false);
    expect(isValidAadhaar("12345678901A")).toBe(false);
  });

  it("validates pan format AAAAA9999A", () => {
    expect(isValidPan("ABCDE1234F")).toBe(true);
    expect(isValidPan("abcde1234f")).toBe(true);
    expect(isValidPan("ABCD1234F")).toBe(false);
    expect(isValidPan("ABCDE12345F")).toBe(false);
  });

  it("validates indian mobile numbers", () => {
    expect(isValidIndianPhone("9363047040")).toBe(true);
    expect(isValidIndianPhone("+919363047040")).toBe(true);
    expect(isValidIndianPhone("09363047040")).toBe(true);
    expect(isValidIndianPhone("5363047040")).toBe(false);
    expect(isValidIndianPhone("936304704")).toBe(false);
  });

  it("normalizes values for storage", () => {
    expect(normalizeAadhaar("1234 5678 9012")).toBe("123456789012");
    expect(normalizePan("abcde1234f")).toBe("ABCDE1234F");
    expect(normalizeIndianPhone("+91 93630 47040")).toBe("9363047040");
  });

  it("formats aadhaar for edit display", () => {
    expect(formatAadhaarForEdit("123456789012")).toBe("1234 5678 9012");
  });

  it("validates pincode", () => {
    expect(isValidPincode("600001")).toBe(true);
    expect(isValidPincode("60001")).toBe(false);
  });
});

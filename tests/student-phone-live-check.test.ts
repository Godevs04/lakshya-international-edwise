import { describe, expect, it } from "vitest";
import {
  INDIAN_PHONE_DIGITS,
  isValidIndianPhone,
  normalizeDigits,
  normalizeIndianPhone,
} from "@/lib/validations/indian-fields";

/** Mirrors when StudentPhoneField triggers a live existence check. */
function shouldCheckStudentPhone(raw: string): boolean {
  const digits = normalizeDigits(raw);
  return digits.length >= INDIAN_PHONE_DIGITS && isValidIndianPhone(normalizeIndianPhone(raw));
}

describe("live student phone check trigger", () => {
  it("waits until a full 10-digit mobile is entered", () => {
    expect(shouldCheckStudentPhone("98765")).toBe(false);
    expect(shouldCheckStudentPhone("987654321")).toBe(false);
    expect(shouldCheckStudentPhone("9876543210")).toBe(true);
    expect(shouldCheckStudentPhone("+91 98765 43210")).toBe(true);
  });

  it("rejects complete but invalid numbers", () => {
    expect(shouldCheckStudentPhone("5876543210")).toBe(false);
    expect(shouldCheckStudentPhone("1234567890")).toBe(false);
  });
});

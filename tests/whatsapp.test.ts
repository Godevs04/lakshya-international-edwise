import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl, getStudentWhatsAppNumber } from "@/lib/utils/whatsapp";

describe("whatsapp", () => {
  it("builds wa.me url for 10-digit indian numbers", () => {
    expect(buildWhatsAppUrl("9876543210")).toBe("https://wa.me/919876543210");
    expect(buildWhatsAppUrl("+91 98765 43210")).toBe("https://wa.me/919876543210");
  });

  it("returns null for invalid numbers", () => {
    expect(buildWhatsAppUrl("12345")).toBeNull();
    expect(buildWhatsAppUrl("")).toBeNull();
  });

  it("prefers whatsapp over phone for chat number", () => {
    expect(getStudentWhatsAppNumber("9898989898", "9876543210")).toBe("9898989898");
    expect(getStudentWhatsAppNumber("", "9876543210")).toBe("9876543210");
    expect(getStudentWhatsAppNumber(undefined, undefined)).toBeNull();
  });
});

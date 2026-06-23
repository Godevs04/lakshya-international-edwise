import { describe, expect, it } from "vitest";
import {
  buildMailtoUrl,
  buildSmsUrl,
  buildTelUrl,
  getStudentContactLinks,
  normalizeIndianMobileDigits,
} from "@/lib/utils/student-contact";
import { buildWhatsAppUrl, getStudentWhatsAppNumber } from "@/lib/utils/whatsapp";

describe("student contact links", () => {
  it("normalizes indian mobile numbers", () => {
    expect(normalizeIndianMobileDigits("9876543210")).toBe("919876543210");
    expect(normalizeIndianMobileDigits("+91 98765 43210")).toBe("919876543210");
    expect(normalizeIndianMobileDigits("12345")).toBeNull();
  });

  it("builds tel and sms urls for mobile handlers", () => {
    expect(buildTelUrl("9876543210")).toBe("tel:+919876543210");
    expect(buildSmsUrl("9876543210", "Hi Kavin,")).toBe(
      "sms:+919876543210?body=Hi%20Kavin%2C"
    );
  });

  it("builds mailto urls", () => {
    expect(buildMailtoUrl("student@example.com", { subject: "Hello" })).toBe(
      "mailto:student@example.com?subject=Hello"
    );
    expect(buildMailtoUrl("invalid")).toBeNull();
  });

  it("builds all student contact links", () => {
    const links = getStudentContactLinks({
      phone: "9876543210",
      whatsapp: "9898989898",
      email: "student@example.com",
      studentName: "Dev Student",
    });

    expect(links.callUrl).toBe("tel:+919876543210");
    expect(links.smsUrl).toContain("sms:+919876543210");
    expect(links.whatsappUrl).toBe("https://wa.me/919898989898");
    expect(links.mailUrl).toContain("mailto:student@example.com");
  });
});

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

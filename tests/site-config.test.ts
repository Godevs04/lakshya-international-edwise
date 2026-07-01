import { describe, expect, it } from "vitest";
import {
  PRODUCTION_COMPANY_NAME,
  PRODUCTION_SITE_URL,
  PRODUCTION_SUPPORT_EMAIL,
  PRODUCTION_SITE_HOST,
  normalizeSupportEmail,
  normalizeSmtpFromAddress,
  isLegacySupportEmail,
} from "@/lib/config/site";

describe("site config", () => {
  it("defines the production domain and support email", () => {
    expect(PRODUCTION_SITE_URL).toBe("https://lakshyainternationaledwise.com");
    expect(PRODUCTION_SUPPORT_EMAIL).toBe("support@lakshyainternationaledwise.com");
    expect(PRODUCTION_COMPANY_NAME).toBe("Lakshya International Edwise");
    expect(PRODUCTION_SITE_HOST).toBe("lakshyainternationaledwise.com");
  });

  it("detects legacy support emails", () => {
    expect(isLegacySupportEmail("hello@teamgodevs.in")).toBe(true);
    expect(isLegacySupportEmail("hello@lakshyainternationaledwise.com")).toBe(true);
    expect(isLegacySupportEmail("support@lakshyainternationaledwise.com")).toBe(false);
  });

  it("normalizes legacy support emails to the production mailbox", () => {
    expect(normalizeSupportEmail("hello@teamgodevs.in")).toBe(PRODUCTION_SUPPORT_EMAIL);
    expect(normalizeSupportEmail("hello@lakshyainternationaledwise.com")).toBe(PRODUCTION_SUPPORT_EMAIL);
    expect(normalizeSupportEmail("support@lakshyainternationaledwise.com")).toBe(PRODUCTION_SUPPORT_EMAIL);
  });

  it("normalizes legacy addresses inside SMTP from headers", () => {
    expect(
      normalizeSmtpFromAddress('Lakshya International Edwise <hello@teamgodevs.in>')
    ).toBe(`Lakshya International Edwise <${PRODUCTION_SUPPORT_EMAIL}>`);
  });
});

import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  renderEmailLayout,
  renderOtpBlock,
  getEmailBannerUrl,
} from "@/lib/services/email-templates";

describe("email-templates", () => {
  it("escapes HTML in user content", () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"
    );
  });

  it("renders branded layout with company name", () => {
    const html = renderEmailLayout({
      company: {
        name: "Nandhini Consultancy",
        logo: "",
        email: "hello@example.com",
        phone: "",
        address: "",
      },
      title: "Test Email",
      bodyHtml: "<p>Hello</p>",
    });
    expect(html).toContain("Nandhini Consultancy");
    expect(html).toContain("Test Email");
    expect(html).toContain("<!DOCTYPE html>");
  });

  it("includes OTP block with code", () => {
    expect(renderOtpBlock("123456")).toContain("123456");
  });

  it("reads optional banner URL from env", () => {
    const original = process.env.APP_EMAIL_BANNER_URL;
    process.env.APP_EMAIL_BANNER_URL = "https://example.com/banner.jpg";
    expect(getEmailBannerUrl()).toBe("https://example.com/banner.jpg");
    if (original === undefined) delete process.env.APP_EMAIL_BANNER_URL;
    else process.env.APP_EMAIL_BANNER_URL = original;
  });
});

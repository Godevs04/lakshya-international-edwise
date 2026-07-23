import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  escapeHtml,
  renderEmailLayout,
  renderOtpBlock,
  getEmailLogoUrl,
} from "@/lib/services/email-templates";
import { resolveEmailAssetUrl } from "@/lib/utils/email-asset-url";

describe("email-templates", () => {
  const originalAuthUrl = process.env.AUTH_URL;

  beforeEach(() => {
    process.env.AUTH_URL = "https://lakshyainternationaledwise.com";
  });

  afterEach(() => {
    if (originalAuthUrl === undefined) delete process.env.AUTH_URL;
    else process.env.AUTH_URL = originalAuthUrl;
  });

  it("escapes HTML in user content", () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"
    );
  });

  it("renders branded layout with company name", () => {
    const html = renderEmailLayout({
      company: {
        name: "Lakshya International Edwise",
        logo: "",
        email: "hello@example.com",
        phone: "",
        address: "",
      },
      title: "Test Email",
      bodyHtml: "<p>Hello</p>",
    });
    expect(html).toContain("Lakshya International Edwise");
    expect(html).toContain("Test Email");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("SN Pro");
  });

  it("resolves relative logo paths to absolute URLs for email clients", () => {
    const html = renderEmailLayout({
      company: {
        name: "Lakshya International Edwise",
        logo: "/Lakshya-App-logo.png",
        email: "hello@example.com",
        phone: "",
        address: "",
      },
      title: "Email Verification",
      bodyHtml: "<p>Hello</p>",
    });
    expect(html).toContain('src="https://lakshyainternationaledwise.com/Lakshya-App-logo.png"');
  });

  it("falls back to public/Lakshya-App-logo.png when company logo is empty", () => {
    const html = renderEmailLayout({
      company: {
        name: "Lakshya International Edwise",
        logo: "",
        email: "hello@example.com",
        phone: "",
        address: "",
      },
      title: "Email Verification",
      bodyHtml: "<p>Hello</p>",
    });
    expect(html).toContain('src="https://lakshyainternationaledwise.com/Lakshya-App-logo.png"');
  });

  it("includes OTP block with digit cells", () => {
    const html = renderOtpBlock("123456");
    expect(html).toContain("1");
    expect(html).toContain("6");
    expect(html).toContain("Verification Code");
  });

  it("uses APP_EMAIL_BANNER_URL as the compact header logo", () => {
    const original = process.env.APP_EMAIL_BANNER_URL;
    process.env.APP_EMAIL_BANNER_URL = "https://example.com/banner.jpg";
    const html = renderEmailLayout({
      company: {
        name: "Lakshya International Edwise",
        logo: "/Lakshya-App-logo.png",
        email: "hello@example.com",
        phone: "",
        address: "",
      },
      title: "Team Mention",
      bodyHtml: "<p>Hello</p>",
    });
    expect(html).toContain('src="https://example.com/banner.jpg"');
    expect(html).not.toContain('src="https://lakshyainternationaledwise.com/Lakshya-App-logo.png"');
    expect(html.match(/banner\.jpg/g)?.length).toBe(1);
    expect(getEmailLogoUrl({
      name: "Lakshya International Edwise",
      logo: "/Lakshya-App-logo.png",
    })).toBe("https://example.com/banner.jpg");
    if (original === undefined) delete process.env.APP_EMAIL_BANNER_URL;
    else process.env.APP_EMAIL_BANNER_URL = original;
  });

  it("falls back to company logo when APP_EMAIL_BANNER_URL is unset", () => {
    const original = process.env.APP_EMAIL_BANNER_URL;
    delete process.env.APP_EMAIL_BANNER_URL;
    expect(getEmailLogoUrl({
      name: "Lakshya International Edwise",
      logo: "/Lakshya-App-logo.png",
    })).toBe("https://lakshyainternationaledwise.com/Lakshya-App-logo.png");
    if (original !== undefined) process.env.APP_EMAIL_BANNER_URL = original;
  });
});

describe("resolveEmailAssetUrl", () => {
  const originalAuthUrl = process.env.AUTH_URL;

  afterEach(() => {
    if (originalAuthUrl === undefined) delete process.env.AUTH_URL;
    else process.env.AUTH_URL = originalAuthUrl;
  });

  it("prefixes relative paths with the app URL", () => {
    process.env.AUTH_URL = "https://lakshyainternationaledwise.com";
    expect(resolveEmailAssetUrl("/Lakshya-App-logo.png")).toBe(
      "https://lakshyainternationaledwise.com/Lakshya-App-logo.png"
    );
  });

  it("passes through absolute URLs unchanged", () => {
    expect(resolveEmailAssetUrl("https://res.cloudinary.com/demo/logo.png")).toBe(
      "https://res.cloudinary.com/demo/logo.png"
    );
  });
});

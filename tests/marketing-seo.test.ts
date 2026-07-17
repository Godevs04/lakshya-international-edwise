import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildMarketingMetadata,
  DEFAULT_MARKETING_KEYWORDS,
  getAbsoluteUrl,
  getDefaultOgImageUrl,
} from "@/lib/seo/marketing-metadata";

describe("marketing SEO metadata", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds canonical and open graph URLs from NEXT_PUBLIC_SITE_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://lakshyainternationaledwise.com");
    const metadata = buildMarketingMetadata({
      title: "Education Loans | Lakshya International Edwise",
      description: "Overseas education loan experts in India.",
      path: "/services",
    });

    expect(metadata.alternates?.canonical).toBe("https://lakshyainternationaledwise.com/services");
    expect(metadata.openGraph?.url).toBe("https://lakshyainternationaledwise.com/services");
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it("uses production domain fallback for absolute URLs in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("AUTH_URL", "");
    expect(getAbsoluteUrl("/contact")).toBe("https://lakshyainternationaledwise.com/contact");
    expect(getDefaultOgImageUrl()).toBe(
      "https://lakshyainternationaledwise.com/logo_model.jpeg"
    );
  });

  it("includes google site verification when configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://lakshyainternationaledwise.com");
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION", "abc123");
    const metadata = buildMarketingMetadata({
      title: "Home",
      description: "Overseas education loan experts.",
      path: "/",
    });
    expect(metadata.verification?.google).toBe("abc123");
  });

  it("defaults to finance-focused keywords", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://lakshyainternationaledwise.com");
    const metadata = buildMarketingMetadata({
      title: "Home",
      description: "Education loan experts.",
      path: "/",
    });
    expect(metadata.keywords).toEqual([...DEFAULT_MARKETING_KEYWORDS]);
    expect(metadata.keywords).toContain("education loan India");
    expect(metadata.keywords).toContain("education finance UAE");
    expect(metadata.keywords).toContain("education loan for Ireland");
    expect(metadata.keywords).toContain("Lakshya International Edwise");
    expect(metadata.keywords).not.toContain("study abroad consultancy India");
  });

  it("supports absolute titles to avoid brand duplication", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://lakshyainternationaledwise.com");
    const metadata = buildMarketingMetadata({
      title: "Lakshya International Edwise | Overseas Education Loan Experts",
      description: "Overseas education loan experts in India.",
      path: "/",
      absoluteTitle: true,
    });
    expect(metadata.title).toEqual({
      absolute: "Lakshya International Edwise | Overseas Education Loan Experts",
    });
  });
});

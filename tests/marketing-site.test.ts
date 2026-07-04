import { afterEach, describe, expect, it, vi } from "vitest";
import { getMarketingContact } from "@/lib/config/marketing";
import {
  formatMarketingPhoneDisplay,
  MARKETING_DEFAULT_PHONE_DISPLAY,
} from "@/lib/constants/marketing/contact";
import { COUNTRY_IMAGE_MAP, getCountryImage } from "@/lib/constants/marketing/country-images";
import { MARKETING_COUNTRIES } from "@/lib/constants/marketing/countries";
import { TRUST_METRICS_SOURCE } from "@/lib/constants/marketing/lakshya-value-props";
import { PRIVACY_POLICY_SECTIONS, TERMS_OF_SERVICE_SECTIONS } from "@/lib/constants/marketing/legal-content";
import { websiteJsonLd } from "@/components/marketing/seo/json-ld";

describe("marketing site configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("falls back to default phone when env is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_CONTACT_PHONE", "");
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    const contact = getMarketingContact();
    expect(contact.phone).toBe(MARKETING_DEFAULT_PHONE_DISPLAY);
    expect(contact.whatsapp).toBeTruthy();
  });

  it("formats Indian phone numbers for display", () => {
    expect(formatMarketingPhoneDisplay("919502180806")).toBe("+91 95021 80806");
    expect(formatMarketingPhoneDisplay("9502180806")).toBe("+91 95021 80806");
  });
});

describe("country images", () => {
  it("maps every marketing country to a local image", () => {
    for (const country of MARKETING_COUNTRIES) {
      const image = getCountryImage(country.slug);
      expect(image, `missing image for ${country.slug}`).toBeDefined();
      expect(image?.src).toMatch(/^\/countries\/images\//);
      expect(country.image).toBe(image?.src);
    }
    expect(Object.keys(COUNTRY_IMAGE_MAP)).toHaveLength(MARKETING_COUNTRIES.length);
  });
});

describe("legal content", () => {
  it("includes substantive privacy and terms sections", () => {
    expect(PRIVACY_POLICY_SECTIONS.length).toBeGreaterThanOrEqual(6);
    expect(TERMS_OF_SERVICE_SECTIONS.length).toBeGreaterThanOrEqual(6);
    expect(PRIVACY_POLICY_SECTIONS.some((s) => s.id === "sharing")).toBe(true);
    expect(TERMS_OF_SERVICE_SECTIONS.some((s) => s.id === "no-guarantee")).toBe(true);
  });
});

describe("structured data", () => {
  it("points site search to FAQ with query parameter", () => {
    const data = websiteJsonLd({
      name: "Lakshya International Edwise",
      url: "https://lakshyainternationaledwise.com",
      searchUrl: "https://lakshyainternationaledwise.com/faq",
    }) as {
      potentialAction: { target: { urlTemplate: string } };
    };

    expect(data.potentialAction.target.urlTemplate).toBe(
      "https://lakshyainternationaledwise.com/faq?q={search_term_string}"
    );
  });
});

describe("trust metrics", () => {
  it("documents a source footnote for published figures", () => {
    expect(TRUST_METRICS_SOURCE).toContain("FY");
    expect(TRUST_METRICS_SOURCE.length).toBeGreaterThan(40);
  });
});

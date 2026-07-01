import { describe, expect, it } from "vitest";
import {
  PRODUCTION_COMPANY_NAME,
  PRODUCTION_SITE_URL,
  PRODUCTION_SUPPORT_EMAIL,
  PRODUCTION_SITE_HOST,
} from "@/lib/config/site";

describe("site config", () => {
  it("defines the production domain and support email", () => {
    expect(PRODUCTION_SITE_URL).toBe("https://lakshyainternationaledwise.com");
    expect(PRODUCTION_SUPPORT_EMAIL).toBe("support@lakshyainternationaledwise.com");
    expect(PRODUCTION_COMPANY_NAME).toBe("Lakshya International Edwise");
    expect(PRODUCTION_SITE_HOST).toBe("lakshyainternationaledwise.com");
  });
});

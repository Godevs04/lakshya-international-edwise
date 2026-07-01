export const PRODUCTION_SITE_URL = "https://lakshyainternationaledwise.com";
export const PRODUCTION_SUPPORT_EMAIL = "support@lakshyainternationaledwise.com";
export const PRODUCTION_COMPANY_NAME = "Lakshya International Edwise";
export const PRODUCTION_SITE_HOST = "lakshyainternationaledwise.com";
export const PRODUCTION_WWW_HOST = `www.${PRODUCTION_SITE_HOST}`;

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

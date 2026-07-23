import type { AppModules, AppTheme, CompanySettings } from "@/types";
import { DEFAULT_APP_LOGO, isLegacyAppLogo } from "@/lib/brand/app-logo";
import {
  isProductionRuntime,
  normalizeSupportEmail,
  PRODUCTION_COMPANY_NAME,
  PRODUCTION_SUPPORT_EMAIL,
} from "@/lib/config/site";

function parseSmtpFrom(from: string | undefined): { name?: string; email?: string } {
  if (!from) return {};
  const match = from.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return { name: match[1]?.trim().replace(/^"|"$/g, ""), email: match[2]?.trim() };
  }
  return { email: normalizeSupportEmail(from.trim()) };
}

export function getDefaultCompanySettings(): CompanySettings {
  const fromSmtp = parseSmtpFrom(process.env.SMTP_FROM);
  const productionEmailFallback = isProductionRuntime() ? PRODUCTION_SUPPORT_EMAIL : "";
  return {
    name: process.env.APP_COMPANY_NAME ?? fromSmtp.name ?? PRODUCTION_COMPANY_NAME,
    logo: process.env.APP_COMPANY_LOGO ?? DEFAULT_APP_LOGO,
    email: normalizeSupportEmail(
      process.env.APP_COMPANY_EMAIL ??
        fromSmtp.email ??
        process.env.SMTP_USER ??
        productionEmailFallback
    ),
    phone: process.env.APP_COMPANY_PHONE ?? "",
    address: process.env.APP_COMPANY_ADDRESS ?? "",
  };
}

/** Env vars override stored DB values so rebranding via .env.local takes effect immediately. */
export function resolveCompanySettings(stored?: Partial<CompanySettings>): CompanySettings {
  const defaults = getDefaultCompanySettings();
  const merged = { ...defaults, ...stored };

  const storedLogo = merged.logo?.trim() || "";
  const logo =
    process.env.APP_COMPANY_LOGO?.trim() ||
    (storedLogo && !isLegacyAppLogo(storedLogo) ? storedLogo : "") ||
    defaults.logo;

  return {
    name: process.env.APP_COMPANY_NAME?.trim() || merged.name?.trim() || defaults.name,
    logo,
    email: normalizeSupportEmail(
      process.env.APP_COMPANY_EMAIL?.trim() || merged.email?.trim() || defaults.email
    ),
    phone: process.env.APP_COMPANY_PHONE?.trim() || merged.phone?.trim() || defaults.phone,
    address: process.env.APP_COMPANY_ADDRESS?.trim() || merged.address?.trim() || defaults.address,
  };
}

export function getDefaultThemeSettings(): AppTheme {
  return {
    primary: process.env.APP_THEME_PRIMARY ?? "oklch(0.72 0.16 65)",
    accent: process.env.APP_THEME_ACCENT ?? "oklch(0.78 0.14 75)",
    radius: process.env.APP_THEME_RADIUS ?? "0.625rem",
    fontFamily: process.env.APP_THEME_FONT ?? "SN Pro",
    mode: (process.env.APP_THEME_MODE as AppTheme["mode"]) ?? "light",
  };
}

export function getDefaultModules(): AppModules {
  return {
    students: process.env.APP_MODULE_STUDENTS !== "false",
    partners: process.env.APP_MODULE_PARTNERS !== "false",
    applications: process.env.APP_MODULE_APPLICATIONS !== "false",
    lenders: process.env.APP_MODULE_LENDERS !== "false",
    tasks: process.env.APP_MODULE_TASKS !== "false",
    reports: process.env.APP_MODULE_REPORTS !== "false",
    analytics: process.env.APP_MODULE_ANALYTICS !== "false",
  };
}

export function getDefaultSettings() {
  return {
    company: getDefaultCompanySettings(),
    theme: getDefaultThemeSettings(),
    modules: getDefaultModules(),
    sessionExpiryHours: parseInt(process.env.APP_SESSION_EXPIRY_HOURS ?? "24", 10),
    smtpConfigured: Boolean(
      process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    ),
  };
}

export function getSeedAdminName(): string {
  return process.env.SEED_ADMIN_NAME ?? "Super Admin";
}

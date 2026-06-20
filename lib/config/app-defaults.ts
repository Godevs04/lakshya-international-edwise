import type { AppModules, AppTheme, CompanySettings } from "@/types";

function parseSmtpFrom(from: string | undefined): { name?: string; email?: string } {
  if (!from) return {};
  const match = from.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return { name: match[1]?.trim().replace(/^"|"$/g, ""), email: match[2]?.trim() };
  }
  return { email: from.trim() };
}

export function getDefaultCompanySettings(): CompanySettings {
  const fromSmtp = parseSmtpFrom(process.env.SMTP_FROM);
  return {
    name: process.env.APP_COMPANY_NAME ?? fromSmtp.name ?? "Consultancy CRM",
    logo: process.env.APP_COMPANY_LOGO ?? "",
    email: process.env.APP_COMPANY_EMAIL ?? fromSmtp.email ?? process.env.SMTP_USER ?? "",
    phone: process.env.APP_COMPANY_PHONE ?? "",
    address: process.env.APP_COMPANY_ADDRESS ?? "",
  };
}

export function getDefaultThemeSettings(): AppTheme {
  return {
    primary: process.env.APP_THEME_PRIMARY ?? "oklch(0.488 0.243 264.376)",
    accent: process.env.APP_THEME_ACCENT ?? "oklch(0.556 0 0)",
    radius: process.env.APP_THEME_RADIUS ?? "0.625rem",
    fontFamily: process.env.APP_THEME_FONT ?? "Geist",
    mode: (process.env.APP_THEME_MODE as AppTheme["mode"]) ?? "system",
  };
}

export function getDefaultModules(): AppModules {
  return {
    students: process.env.APP_MODULE_STUDENTS !== "false",
    partners: process.env.APP_MODULE_PARTNERS !== "false",
    applications: process.env.APP_MODULE_APPLICATIONS !== "false",
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

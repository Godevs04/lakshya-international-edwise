import { APP_TAGLINE, APP_LOGO_ASPECT_RATIO, DEFAULT_APP_LOGO } from "@/lib/brand/app-logo";
import { getDefaultCompanySettings } from "@/lib/config/app-defaults";
import { getAuthUrl } from "@/lib/config/env";
import { resolveEmailAssetUrl } from "@/lib/utils/email-asset-url";
import type { CompanySettings } from "@/types";

/** Design 06 palette — deep indigo, violet accent, clean neutrals */
const BRAND = {
  primary: "#2D1B69",
  primaryMid: "#6D5EF7",
  accent: "#8B5CF6",
  accentLight: "#C4B5FD",
  text: "#1E293B",
  muted: "#64748B",
  border: "#E5E7EB",
  surface: "#F8F7FC",
  otpCell: "#EDEAFD",
  white: "#FFFFFF",
  link: "#6D5EF7",
  success: "#166534",
  successBg: "#F0FDF4",
  footerBg: "#1E0B4A",
};

const FONT = "'SN Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function emailFontStyles(): string {
  const fontUrl = `${getAuthUrl()}/fonts/SNPro-Variable.woff2`;
  return `
    @font-face {
      font-family: 'SN Pro';
      font-style: normal;
      font-weight: 200 900;
      font-display: swap;
      src: url('${escapeHtml(fontUrl)}') format('woff2');
    }`;
}

export function getEmailBannerUrl(): string | undefined {
  const url = process.env.APP_EMAIL_BANNER_URL?.trim();
  return url ? resolveEmailAssetUrl(url) : undefined;
}

export async function getEmailBranding(): Promise<CompanySettings> {
  try {
    const { getAppConfig } = await import("@/lib/config/app-config");
    const config = await getAppConfig();
    return config.company;
  } catch {
    return getDefaultCompanySettings();
  }
}

function emailButton(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0 24px;">
      <tr>
        <td align="left" style="background-color: ${BRAND.primaryMid}; border-radius: 8px;">
          <a href="${safeHref}" target="_blank" rel="noopener noreferrer"
            style="display: inline-block; padding: 14px 36px; font-family: ${FONT}; font-size: 14px; font-weight: 600; letter-spacing: 0.04em; color: #ffffff; text-decoration: none; border-radius: 4px;">
            ${safeLabel}
          </a>
        </td>
      </tr>
    </table>`;
}

function emailHeader(company: CompanySettings): string {
  const name = escapeHtml(company.name);
  const logo = resolveEmailAssetUrl(company.logo?.trim() || DEFAULT_APP_LOGO);
  const tagline = escapeHtml(APP_TAGLINE);
  const banner = getEmailBannerUrl();
  const logoWidth = 72;
  const logoHeight = Math.round(logoWidth / APP_LOGO_ASPECT_RATIO);

  const logoBlock = logo
    ? `<img src="${escapeHtml(logo)}" alt="${name}" width="${logoWidth}" height="${logoHeight}" style="display: block; border: 0; border-radius: 12px; object-fit: contain; background-color: ${BRAND.white}; box-shadow: 0 4px 14px rgba(109, 94, 247, 0.18);" />`
    : `<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td width="56" height="56" align="center" valign="middle" style="width: 56px; height: 56px; background: linear-gradient(135deg, ${BRAND.primaryMid}, ${BRAND.accent}); border-radius: 50%; font-family: ${FONT}; font-size: 22px; font-weight: 700; color: #ffffff;">${escapeHtml(company.name.charAt(0).toUpperCase())}</td></tr></table>`;

  const bannerBlock = banner
    ? `<tr>
        <td style="padding: 0; line-height: 0; border-bottom: 1px solid ${BRAND.border};">
          <img src="${escapeHtml(banner)}" alt="" width="600" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0;" />
        </td>
      </tr>`
    : "";

  return `
    <tr>
      <td style="padding: 0; background: linear-gradient(90deg, ${BRAND.primaryMid}, ${BRAND.accent}); height: 3px; font-size: 0; line-height: 0;">&nbsp;</td>
    </tr>
    <tr>
      <td class="email-header" style="padding: 28px 40px 24px; background-color: ${BRAND.white}; border-bottom: 1px solid ${BRAND.border};">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="width: ${logoWidth}px; vertical-align: middle; padding-right: 16px;">${logoBlock}</td>
            <td style="vertical-align: middle;">
              <p style="margin: 0; font-family: ${FONT}; font-size: 20px; font-weight: 600; color: ${BRAND.primary}; letter-spacing: -0.02em; line-height: 1.3;">${name}</p>
              <p style="margin: 4px 0 0; font-family: ${FONT}; font-size: 12px; font-weight: 500; color: ${BRAND.muted}; letter-spacing: 0.02em;">${tagline}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${bannerBlock}`;
}

function emailFooter(company: CompanySettings): string {
  const contactLines: string[] = [];
  if (company.address?.trim()) contactLines.push(escapeHtml(company.address.trim()));
  if (company.phone?.trim()) contactLines.push(`Tel: ${escapeHtml(company.phone.trim())}`);
  if (company.email?.trim()) {
    contactLines.push(
      `<a href="mailto:${escapeHtml(company.email.trim())}" style="color: ${BRAND.accentLight}; text-decoration: none;">${escapeHtml(company.email.trim())}</a>`
    );
  }

  return `
    <tr>
      <td style="padding: 0; background: linear-gradient(90deg, ${BRAND.primaryMid}, ${BRAND.accent}); height: 2px; font-size: 0; line-height: 0;">&nbsp;</td>
    </tr>
    <tr>
      <td class="email-footer" style="padding: 28px 40px 32px; background-color: ${BRAND.footerBg};">
        <p style="margin: 0 0 10px; font-family: ${FONT}; font-size: 14px; font-weight: 600; color: #ffffff;">${escapeHtml(company.name)}</p>
        ${contactLines.length ? `<p style="margin: 0 0 16px; font-family: ${FONT}; font-size: 12px; line-height: 1.7; color: rgba(255,255,255,0.65);">${contactLines.join("<br />")}</p>` : ""}
        <p style="margin: 0 0 12px; font-family: ${FONT}; font-size: 11px; line-height: 1.6; color: rgba(255,255,255,0.45);">
          This is a system-generated communication from the ${escapeHtml(company.name)} CRM platform. Please do not reply to this message.
        </p>
        <p style="margin: 0; font-family: ${FONT}; font-size: 11px; color: rgba(255,255,255,0.35);">
          &copy; ${new Date().getFullYear()} ${escapeHtml(company.name)}. All rights reserved. Confidential.
        </p>
      </td>
    </tr>`;
}

export interface EmailLayoutOptions {
  company: CompanySettings;
  preheader?: string;
  title: string;
  subtitle?: string;
  bodyHtml: string;
}

export function renderEmailLayout(options: EmailLayoutOptions): string {
  const { company, preheader, title, subtitle, bodyHtml } = options;
  const safeTitle = escapeHtml(title);
  const safeSubtitle = subtitle ? escapeHtml(subtitle) : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${safeTitle}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    ${emailFontStyles()}
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-body { padding: 28px 24px !important; }
      .email-header { padding: 24px 24px 20px !important; }
      .email-footer { padding: 24px 24px 28px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ECEEF1; -webkit-font-smoothing: antialiased;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${escapeHtml(preheader)}</div>` : ""}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ECEEF1; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" class="email-container" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background: ${BRAND.white}; border: 1px solid ${BRAND.border};">
          ${emailHeader(company)}
          <tr>
            <td class="email-body" style="padding: 36px 40px 32px; font-family: ${FONT};">
              <h1 style="margin: 0 0 6px; font-family: ${FONT}; font-size: 22px; font-weight: 600; color: ${BRAND.primary}; letter-spacing: -0.02em; line-height: 1.35;">${safeTitle}</h1>
              ${safeSubtitle ? `<p style="margin: 0 0 24px; font-size: 14px; color: ${BRAND.muted}; line-height: 1.5;">${safeSubtitle}</p>` : `<div style="margin-bottom: 24px;"></div>`}
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 28px;">
                <tr><td style="border-top: 1px solid ${BRAND.border}; font-size: 0; line-height: 0;">&nbsp;</td></tr>
              </table>
              ${bodyHtml}
            </td>
          </tr>
          ${emailFooter(company)}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderGreeting(name: string): string {
  return `<p style="margin: 0 0 20px; font-size: 15px; line-height: 1.65; color: ${BRAND.text};">Dear ${escapeHtml(name)},</p>`;
}

export function renderMutedNote(text: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 28px;">
      <tr>
        <td style="padding: 16px 20px; background-color: ${BRAND.surface}; border: 1px solid ${BRAND.border}; border-left: 3px solid ${BRAND.primaryMid};">
          <p style="margin: 0; font-size: 13px; line-height: 1.65; color: ${BRAND.muted};">${text}</p>
        </td>
      </tr>
    </table>`;
}

export function renderInfoBox(message: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
      <tr>
        <td style="padding: 18px 22px; background-color: ${BRAND.successBg}; border: 1px solid #BBF7D0; border-left: 3px solid ${BRAND.success};">
          <p style="margin: 0; font-size: 14px; font-weight: 500; line-height: 1.55; color: ${BRAND.success};">${message}</p>
        </td>
      </tr>
    </table>`;
}

export function renderOtpBlock(otp: string): string {
  const digitCells = otp
    .replace(/\D/g, "")
    .split("")
    .map(
      (digit) => `
        <td style="padding: 0 4px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td align="center" valign="middle" width="44" height="52" style="width: 44px; height: 52px; background-color: ${BRAND.otpCell}; border-radius: 8px; font-family: ${FONT}; font-size: 26px; font-weight: 700; color: ${BRAND.primary}; line-height: 52px;">
                ${escapeHtml(digit)}
              </td>
            </tr>
          </table>
        </td>`
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
      <tr>
        <td align="center" style="padding: 28px 24px; background-color: ${BRAND.surface}; border: 1px solid ${BRAND.border}; border-radius: 8px;">
          <p style="margin: 0 0 16px; font-family: ${FONT}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.14em; color: ${BRAND.muted};">Verification Code</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
            <tr>${digitCells}</tr>
          </table>
          <p style="margin: 16px 0 0; font-family: ${FONT}; font-size: 12px; color: ${BRAND.muted};">Expires in 10 minutes</p>
        </td>
      </tr>
    </table>`;
}

export function renderFeatureList(items: string[]): string {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 5px 0; vertical-align: top; width: 20px; font-size: 14px; color: ${BRAND.primaryMid};">&#8226;</td>
        <td style="padding: 5px 0 5px 4px; font-size: 14px; line-height: 1.55; color: ${BRAND.text};">${escapeHtml(item)}</td>
      </tr>`
    )
    .join("");

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0 8px;">
      ${rows}
    </table>`;
}

export function renderLinkFallback(url: string): string {
  return `
    <p style="margin: 8px 0 0; font-size: 12px; line-height: 1.6; color: ${BRAND.muted};">
      If the button above does not work, copy and paste this URL into your browser:<br />
      <a href="${escapeHtml(url)}" style="color: ${BRAND.link}; word-break: break-all; text-decoration: underline;">${escapeHtml(url)}</a>
    </p>`;
}

export { emailButton, BRAND };

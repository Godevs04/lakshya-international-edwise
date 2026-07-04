import localFont from "next/font/local";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

/**
 * SN Pro — https://fonts.google.com/specimen/SN+Pro
 * Self-hosted variable font (Google Fonts) for consistent rendering across browsers.
 */
export const fontSans = localFont({
  src: "../app/fonts/SNPro-Variable.woff2",
  variable: "--font-sn-pro",
  display: "swap",
  weight: "200 900",
  preload: true,
  adjustFontFallback: "Arial",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
});

export const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  weight: ["400", "500"],
});

/**
 * Plus Jakarta Sans — clean, premium sans used across the finance marketing site.
 */
export const fontMarketing = Plus_Jakarta_Sans({
  variable: "--font-marketing",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

export const fontFamilySans =
  'var(--font-sn-pro), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

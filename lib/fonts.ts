import localFont from "next/font/local";

/**
 * SN Pro — https://fonts.google.com/specimen/SN+Pro
 * Self-hosted variable font for consistent rendering across browsers.
 */
export const fontSans = localFont({
  src: "../app/fonts/SNPro-Variable.woff2",
  variable: "--font-sn-pro",
  display: "swap",
  weight: "200 900",
  preload: true,
  adjustFontFallback: "Arial",
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "sans-serif",
  ],
});

/**
 * JetBrains Mono — self-hosted (avoids next/font/google fetch failures on Vercel Turbopack).
 */
export const fontMono = localFont({
  src: [
    {
      path: "../app/fonts/JetBrainsMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../app/fonts/JetBrainsMono-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-mono",
  display: "swap",
  preload: true,
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
});

/**
 * Plus Jakarta Sans — self-hosted variable font for the marketing site.
 * Avoids Google Fonts CDN fetches during `next build` (Turbopack 404s on stale gstatic URLs).
 */
export const fontMarketing = localFont({
  src: "../app/fonts/PlusJakartaSans-Variable.woff2",
  variable: "--font-marketing",
  display: "swap",
  weight: "200 800",
  preload: true,
  adjustFontFallback: "Arial",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

export const fontFamilySans =
  'var(--font-marketing), var(--font-sn-pro), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

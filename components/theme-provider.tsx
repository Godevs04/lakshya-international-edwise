"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/**
 * Theme context only. FOUC script lives in `app/layout.tsx` (Server Component)
 * because React 19 forbids <script> from Client Components (incl. useServerInsertedHTML).
 * next-themes ThemeScript is patched to return null — see scripts/patch-next-themes.mjs.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

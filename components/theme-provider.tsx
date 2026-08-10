"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/**
 * Thin wrapper around next-themes.
 * FOUC-prevention script is SSR-only (patched next-themes) so React 19
 * does not warn about <script> inside client components.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

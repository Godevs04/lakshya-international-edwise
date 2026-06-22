"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/**
 * React 19 warns when next-themes injects an inline <script> on the client.
 * Server: keep default script for anti-FOUC. Client: use application/json so React ignores it.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

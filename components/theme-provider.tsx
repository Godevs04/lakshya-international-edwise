"use client";

import { useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/**
 * FOUC-prevention script injected outside the React component tree.
 * next-themes ThemeScript is patched to always return null (React 19 forbids
 * <script> inside Client Components).
 */
const THEME_INIT_SCRIPT = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('theme')||'light';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;d.classList.remove('light','dark');d.classList.add(r);d.style.colorScheme=r;}catch(e){}})();`;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const inserted = useRef(false);

  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return (
      <script id="lakshya-theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
    );
  });

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

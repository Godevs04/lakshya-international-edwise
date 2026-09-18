/**
 * Inline FOUC-prevention script for the document root.
 * Must run before paint; inject from a Server Component layout only
 * (never from a Client Component — React 19 forbids that).
 */
export const THEME_INIT_SCRIPT = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('theme')||'light';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;d.classList.remove('light','dark');d.classList.add(r);d.style.colorScheme=r;}catch(e){}})();`;

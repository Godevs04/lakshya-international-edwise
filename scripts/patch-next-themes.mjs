/**
 * Patch next-themes so ThemeScript never renders a <script> inside a Client Component.
 * React 19 / Next 16 warn: "Encountered a script tag while rendering React component".
 * FOUC prevention is handled by useServerInsertedHTML in components/theme-provider.tsx.
 * @see https://github.com/pacocoursey/next-themes/issues/385
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "node_modules", "next-themes", "dist");

/** Match ThemeScript memo bodies (patched or unpatched) and force `return null`. */
const targets = [
  {
    file: join(root, "index.mjs"),
    // Unpatched original
    find: '_=t.memo(({forcedTheme:e,storageKey:i,attribute:s,enableSystem:u,enableColorScheme:m,defaultTheme:a,value:l,themes:h,nonce:d,scriptProps:w})=>{let p=JSON.stringify([s,i,a,e,h,l,u,m]).slice(1,-1);return t.createElement("script",{...w,suppressHydrationWarning:!0,nonce:typeof window=="undefined"?d:"",dangerouslySetInnerHTML:{__html:`(${M.toString()})(${p})`}})})',
    // Earlier SSR-only patch
    findAlt:
      '_=t.memo(({forcedTheme:e,storageKey:i,attribute:s,enableSystem:u,enableColorScheme:m,defaultTheme:a,value:l,themes:h,nonce:d,scriptProps:w})=>{if(typeof window!=="undefined")return null;let p=JSON.stringify([s,i,a,e,h,l,u,m]).slice(1,-1);return t.createElement("script",{...w,suppressHydrationWarning:!0,nonce:d,dangerouslySetInnerHTML:{__html:`(${M.toString()})(${p})`}})})',
    replace:
      "_=t.memo(({forcedTheme:e,storageKey:i,attribute:s,enableSystem:u,enableColorScheme:m,defaultTheme:a,value:l,themes:h,nonce:d,scriptProps:w})=>{return null})",
  },
  {
    file: join(root, "index.js"),
    find: 'Y=t.memo(({forcedTheme:e,storageKey:s,attribute:n,enableSystem:l,enableColorScheme:o,defaultTheme:d,value:u,themes:h,nonce:m,scriptProps:w})=>{let p=JSON.stringify([n,s,d,e,h,u,l,o]).slice(1,-1);return t.createElement("script",{...w,suppressHydrationWarning:!0,nonce:typeof window=="undefined"?m:"",dangerouslySetInnerHTML:{__html:`(${I.toString()})(${p})`}})})',
    findAlt:
      'Y=t.memo(({forcedTheme:e,storageKey:s,attribute:n,enableSystem:l,enableColorScheme:o,defaultTheme:d,value:u,themes:h,nonce:m,scriptProps:w})=>{if(typeof window!=="undefined")return null;let p=JSON.stringify([n,s,d,e,h,u,l,o]).slice(1,-1);return t.createElement("script",{...w,suppressHydrationWarning:!0,nonce:m,dangerouslySetInnerHTML:{__html:`(${I.toString()})(${p})`}})})',
    replace:
      "Y=t.memo(({forcedTheme:e,storageKey:s,attribute:n,enableSystem:l,enableColorScheme:o,defaultTheme:d,value:u,themes:h,nonce:m,scriptProps:w})=>{return null})",
  },
];

let changed = 0;
for (const { file, find, findAlt, replace } of targets) {
  if (!existsSync(file)) {
    console.warn(`[patch-next-themes] skip missing ${file}`);
    continue;
  }
  let src = readFileSync(file, "utf8");
  if (src.includes(replace)) {
    console.log(`[patch-next-themes] already patched ${file}`);
    continue;
  }
  if (src.includes(find)) {
    src = src.replace(find, replace);
  } else if (src.includes(findAlt)) {
    src = src.replace(findAlt, replace);
  } else {
    console.warn(
      `[patch-next-themes] pattern not found in ${file} — next-themes version may have changed`
    );
    continue;
  }
  writeFileSync(file, src);
  changed += 1;
  console.log(`[patch-next-themes] patched ${file}`);
}

if (changed === 0) {
  process.exitCode = 0;
}

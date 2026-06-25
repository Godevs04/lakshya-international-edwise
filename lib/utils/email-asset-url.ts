import { getPublicAuthUrl } from "@/lib/config/env";

/** Email clients require absolute URLs for images and web fonts. */
export function resolveEmailAssetUrl(url?: string): string | undefined {
  if (!url?.trim()) return undefined;
  const src = url.trim();

  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }

  if (src.startsWith("//")) {
    return `https:${src}`;
  }

  const base = getPublicAuthUrl();
  if (src.startsWith("/")) {
    return `${base}${src}`;
  }

  return `${base}/${src}`;
}

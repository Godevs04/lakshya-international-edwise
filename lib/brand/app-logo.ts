export const DEFAULT_APP_LOGO = "/Lakshya-App-logo.png";

/** Near-square logo intrinsic ratio (4096×4100 source). */
export const APP_LOGO_ASPECT_RATIO = 4096 / 4100;

export const APP_TAGLINE = "Your go-to education loan expert";

const LEGACY_LOGO_SUFFIXES = ["/logo_model.jpeg", "logo_model.jpeg"] as const;

/** True when a stored/env logo still points at the previous landscape mark. */
export function isLegacyAppLogo(src: string | undefined | null): boolean {
  if (!src?.trim()) return false;
  const path = src.trim().split("?")[0]?.toLowerCase() ?? "";
  return LEGACY_LOGO_SUFFIXES.some((suffix) => path === suffix || path.endsWith(suffix));
}

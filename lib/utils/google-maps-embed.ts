export type MapCenter = [longitude: number, latitude: number];

/** Accepts a Google Maps embed URL or full iframe HTML from Google Maps share dialog. */
export function parseGoogleMapsEmbedUrl(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch?.[1]) {
    return normalizeEmbedUrl(iframeMatch[1]);
  }

  return normalizeEmbedUrl(trimmed);
}

function normalizeEmbedUrl(url: string): string | null {
  const candidate = url.trim();
  if (!candidate) return null;

  const withProtocol = candidate.startsWith("http") ? candidate : `https://${candidate}`;
  try {
    const parsed = new URL(withProtocol);
    if (!parsed.hostname.includes("google.") || !parsed.pathname.includes("/maps/embed")) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function parseEnvMapCenter(): MapCenter | null {
  const lat = process.env.NEXT_PUBLIC_OFFICE_MAP_LAT?.trim();
  const lng = process.env.NEXT_PUBLIC_OFFICE_MAP_LNG?.trim();
  if (!lat || !lng) return null;

  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return [longitude, latitude];
}

/** Extracts [lng, lat] from a Google embed URL, with optional env fallback. */
export function parseGoogleMapsEmbedCenter(value?: string | null): MapCenter | null {
  const fromEnv = parseEnvMapCenter();
  if (fromEnv) return fromEnv;

  const embedUrl = parseGoogleMapsEmbedUrl(value);
  if (!embedUrl) return null;

  const latMatch = embedUrl.match(/!3d(-?\d+(?:\.\d+)?)/);
  const lngMatch = embedUrl.match(/!2d(-?\d+(?:\.\d+)?)/);
  if (latMatch && lngMatch) {
    return [Number(lngMatch[1]), Number(latMatch[1])];
  }

  const atMatch = embedUrl.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch) {
    return [Number(atMatch[2]), Number(atMatch[1])];
  }

  return null;
}

export function getGoogleMapsDirectionsUrl(destination: string): string {
  const query = destination.trim();
  if (!query) return "https://www.google.com/maps";
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

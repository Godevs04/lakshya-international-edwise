export function normalizeDocumentUrl(url: string): string {
  return url.trim();
}

export function isValidDocumentUrl(url: string): boolean {
  const normalized = normalizeDocumentUrl(url);
  if (!normalized) {
    return false;
  }

  try {
    const parsed = new URL(normalized);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function getDocumentUrlError(url: string): string | null {
  const normalized = normalizeDocumentUrl(url);
  if (!normalized) {
    return "Document URL is required";
  }
  if (!isValidDocumentUrl(normalized)) {
    return "Enter a valid HTTPS link (e.g. a Google Drive share URL)";
  }
  return null;
}

export function getOptionalLinkUrlError(url: string | undefined): string | null {
  const normalized = url?.trim();
  if (!normalized) {
    return null;
  }
  return getDocumentUrlError(normalized);
}

export function normalizeOptionalLinkUrl(url: string | undefined): string | undefined {
  const normalized = url?.trim();
  return normalized || undefined;
}

export function isDirectImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|avif)(\?|$)/i.test(url) || url.includes("res.cloudinary.com");
}

export function buildWhatsAppUrl(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) {
    return null;
  }

  let normalized = digits;
  if (normalized.length === 10) {
    normalized = `91${normalized}`;
  } else if (normalized.length === 12 && normalized.startsWith("91")) {
    normalized = normalized;
  } else if (normalized.length === 11 && normalized.startsWith("0")) {
    normalized = `91${normalized.slice(1)}`;
  } else {
    return null;
  }

  if (!/^91[6-9]\d{9}$/.test(normalized)) {
    return null;
  }

  return `https://wa.me/${normalized}`;
}

export function getStudentWhatsAppNumber(whatsapp?: string, phone?: string): string | null {
  const candidate = (whatsapp?.trim() || phone?.trim()) ?? "";
  return candidate || null;
}

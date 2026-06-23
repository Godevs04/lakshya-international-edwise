/** Normalize to 91XXXXXXXXXX for Indian mobiles, or null if invalid. */
export function normalizeIndianMobileDigits(phone: string): string | null {
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

  return normalized;
}

export function getStudentPhoneNumber(phone?: string, whatsapp?: string): string | null {
  const candidate = (phone?.trim() || whatsapp?.trim()) ?? "";
  return candidate || null;
}

export function getStudentWhatsAppNumber(whatsapp?: string, phone?: string): string | null {
  const candidate = (whatsapp?.trim() || phone?.trim()) ?? "";
  return candidate || null;
}

export function buildTelUrl(phone: string): string | null {
  const normalized = normalizeIndianMobileDigits(phone);
  return normalized ? `tel:+${normalized}` : null;
}

export function buildSmsUrl(phone: string, body?: string): string | null {
  const normalized = normalizeIndianMobileDigits(phone);
  if (!normalized) {
    return null;
  }

  const base = `sms:+${normalized}`;
  if (!body?.trim()) {
    return base;
  }

  return `${base}?body=${encodeURIComponent(body.trim())}`;
}

export function buildMailtoUrl(
  email: string,
  options?: { subject?: string; body?: string }
): string | null {
  const trimmed = email.trim();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return null;
  }

  const params = new URLSearchParams();
  if (options?.subject?.trim()) {
    params.set("subject", options.subject.trim());
  }
  if (options?.body?.trim()) {
    params.set("body", options.body.trim());
  }

  const query = params.toString();
  return query ? `mailto:${trimmed}?${query}` : `mailto:${trimmed}`;
}

export interface StudentContactLinks {
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  callUrl: string | null;
  smsUrl: string | null;
  whatsappUrl: string | null;
  mailUrl: string | null;
}

export function getStudentContactLinks(input: {
  phone?: string;
  whatsapp?: string;
  email?: string;
  studentName?: string;
}): StudentContactLinks {
  const phone = getStudentPhoneNumber(input.phone, input.whatsapp);
  const whatsapp = getStudentWhatsAppNumber(input.whatsapp, input.phone);
  const email = input.email?.trim() || null;
  const greetingName = input.studentName?.trim();

  const smsBody = greetingName ? `Hi ${greetingName},` : undefined;
  const mailSubject = greetingName ? `Student inquiry — ${greetingName}` : "Student inquiry";
  const mailBody = greetingName ? `Hi ${greetingName},\n\n` : undefined;

  return {
    phone,
    whatsapp,
    email,
    callUrl: phone ? buildTelUrl(phone) : null,
    smsUrl: phone ? buildSmsUrl(phone, smsBody) : null,
    whatsappUrl: whatsapp ? buildWhatsAppUrlFromDigits(whatsapp) : null,
    mailUrl: email ? buildMailtoUrl(email, { subject: mailSubject, body: mailBody }) : null,
  };
}

function buildWhatsAppUrlFromDigits(phone: string): string | null {
  const normalized = normalizeIndianMobileDigits(phone);
  return normalized ? `https://wa.me/${normalized}` : null;
}

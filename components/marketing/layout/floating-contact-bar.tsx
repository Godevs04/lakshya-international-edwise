"use client";

import { MessageCircle, Phone, Mail } from "lucide-react";

interface FloatingContactBarProps {
  whatsappLink?: string | null;
  phone?: string | null;
  email?: string | null;
}

export function FloatingContactBar({
  whatsappLink,
  phone,
  email,
}: FloatingContactBarProps) {
  const phoneHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;
  const emailHref = email ? `mailto:${email}` : null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2.5 md:bottom-6 md:right-6">
      {whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="h-5 w-5" />
        </a>
      )}
      {phoneHref && (
        <a
          href={phoneHref}
          className="btn-marketing inline-flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition hover:scale-105"
          aria-label="Call us"
        >
          <Phone className="h-5 w-5" />
        </a>
      )}
      {emailHref && (
        <a
          href={emailHref}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-white text-primary shadow-lg transition hover:scale-105"
          aria-label="Email us"
        >
          <Mail className="h-5 w-5" />
        </a>
      )}
    </div>
  );
}

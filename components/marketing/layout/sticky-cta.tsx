"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

interface StickyCtaProps {
  whatsappLink?: string | null;
}

export function StickyCta({ whatsappLink }: StickyCtaProps) {
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 md:bottom-6 md:right-6">
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
      <Link
        href="/contact"
        className="btn-marketing hidden rounded-full px-4 py-3 text-sm font-semibold shadow-lg md:inline-flex"
      >
        Book Consultation
      </Link>
    </div>
  );
}

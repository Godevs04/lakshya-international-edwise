"use client";

import type { ReactElement } from "react";

function AccommodationAccent() {
  return (
    <div className="services-bento-accent services-bento-accent-accommodation" aria-hidden>
      <svg viewBox="0 0 120 80" fill="none" className="services-bento-accent-svg">
        <rect x="8" y="28" width="104" height="44" rx="6" fill="url(#acc-grad)" opacity="0.9" />
        <path d="M60 12L8 32h104L60 12z" fill="url(#acc-grad-2)" />
        <rect x="24" y="44" width="16" height="16" rx="2" fill="white" opacity="0.5" />
        <rect x="52" y="44" width="16" height="16" rx="2" fill="white" opacity="0.5" />
        <rect x="80" y="44" width="16" height="16" rx="2" fill="white" opacity="0.5" />
        <defs>
          <linearGradient id="acc-grad" x1="8" y1="28" x2="112" y2="72">
            <stop stopColor="#0b8fd8" stopOpacity="0.15" />
            <stop offset="1" stopColor="#4fc3f7" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="acc-grad-2" x1="60" y1="12" x2="60" y2="32">
            <stop stopColor="#0b8fd8" stopOpacity="0.25" />
            <stop offset="1" stopColor="#0b8fd8" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function BlockedAccountAccent() {
  return (
    <div className="services-bento-accent services-bento-accent-blocked" aria-hidden>
      <span className="services-bento-accent-gradient-bar" />
      <svg viewBox="0 0 80 80" fill="none" className="services-bento-accent-svg services-bento-accent-svg-sm">
        <rect x="16" y="20" width="48" height="40" rx="8" stroke="#0b8fd8" strokeWidth="1.5" opacity="0.35" />
        <path d="M28 36h24M28 44h16" stroke="#0b8fd8" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <circle cx="52" cy="44" r="8" fill="#0b8fd8" opacity="0.12" />
        <path d="M49 44l2 2 4-4" stroke="#0b8fd8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function ForexAccent() {
  return (
    <div className="services-bento-accent services-bento-accent-forex" aria-hidden>
      <div className="services-bento-currency-stack">
        <span className="services-bento-currency services-bento-currency-usd">$</span>
        <span className="services-bento-currency services-bento-currency-eur">€</span>
        <span className="services-bento-currency services-bento-currency-gbp">£</span>
      </div>
      <svg viewBox="0 0 100 40" fill="none" className="services-bento-accent-curve">
        <path
          d="M4 32 Q30 8 50 24 T96 16"
          stroke="url(#forex-line)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="forex-line" x1="4" y1="32" x2="96" y2="16">
            <stop stopColor="#0b8fd8" stopOpacity="0.5" />
            <stop offset="1" stopColor="#4fc3f7" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function PreparationAccent() {
  return (
    <div className="services-bento-accent services-bento-accent-prep" aria-hidden>
      <svg viewBox="0 0 90 70" fill="none" className="services-bento-accent-svg">
        <path
          d="M12 14h66a4 4 0 014 4v40a4 4 0 01-4 4H12a4 4 0 01-4-4V18a4 4 0 014-4z"
          fill="url(#book-fill)"
        />
        <path d="M45 14v48" stroke="#0b8fd8" strokeWidth="1" opacity="0.2" />
        <path d="M20 28h22M20 36h30M20 44h18" stroke="#0b8fd8" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
        <defs>
          <linearGradient id="book-fill" x1="8" y1="14" x2="82" y2="62">
            <stop stopColor="#0b8fd8" stopOpacity="0.12" />
            <stop offset="1" stopColor="#4fc3f7" stopOpacity="0.06" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function CreditCardAccent() {
  return (
    <div className="services-bento-accent services-bento-accent-card" aria-hidden>
      <div className="services-bento-credit-card">
        <span className="services-bento-credit-chip" />
        <span className="services-bento-credit-stripe" />
        <span className="services-bento-credit-number">•••• 4289</span>
      </div>
    </div>
  );
}

const ACCENT_BY_SLUG: Record<string, () => ReactElement> = {
  accommodation: AccommodationAccent,
  "blocked-account-gic": BlockedAccountAccent,
  "forex-transfers": ForexAccent,
  "test-preparation": PreparationAccent,
  "credit-cards": CreditCardAccent,
};

export function ServiceCardAccent({ slug }: { slug: string }) {
  const Accent = ACCENT_BY_SLUG[slug];
  if (!Accent) return null;
  return <Accent />;
}

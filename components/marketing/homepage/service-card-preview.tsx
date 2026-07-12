"use client";

import type { ReactElement } from "react";
import { MapPin, ShieldCheck, TrendingUp, BookOpen, CreditCard } from "lucide-react";

function AccommodationPreview() {
  return (
    <div className="services-bento-preview services-bento-preview-accommodation">
      <div className="services-bento-preview-glass" aria-hidden />
      <div className="services-bento-preview-map">
        <span className="services-bento-preview-pin services-bento-preview-pin-1">
          <MapPin className="h-3 w-3" aria-hidden />
          London
        </span>
        <span className="services-bento-preview-pin services-bento-preview-pin-2">
          <MapPin className="h-3 w-3" aria-hidden />
          Berlin
        </span>
        <span className="services-bento-preview-pin services-bento-preview-pin-3">
          <MapPin className="h-3 w-3" aria-hidden />
          Toronto
        </span>
        <svg viewBox="0 0 200 80" className="services-bento-preview-map-lines" aria-hidden>
          <path
            d="M24 52 Q70 28 100 44 T176 36"
            stroke="rgba(11,143,216,0.2)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            fill="none"
          />
        </svg>
      </div>
      <div className="services-bento-preview-stat-row">
        <span>500+ verified homes</span>
        <span>Near campus</span>
      </div>
    </div>
  );
}

function BlockedAccountPreview() {
  return (
    <div className="services-bento-preview services-bento-preview-blocked">
      <div className="services-bento-preview-glass" aria-hidden />
      <div className="services-bento-preview-countries">
        <div className="services-bento-preview-country">
          <span className="services-bento-preview-flag" aria-hidden>
            🇩🇪
          </span>
          <div>
            <strong>Germany</strong>
            <span>Blocked Account</span>
          </div>
          <ShieldCheck className="services-bento-preview-check h-4 w-4" aria-hidden />
        </div>
        <div className="services-bento-preview-country">
          <span className="services-bento-preview-flag" aria-hidden>
            🇨🇦
          </span>
          <div>
            <strong>Canada</strong>
            <span>GIC Setup</span>
          </div>
          <ShieldCheck className="services-bento-preview-check h-4 w-4" aria-hidden />
        </div>
      </div>
      <span className="services-bento-preview-badge">Visa-ready in 48 hrs</span>
    </div>
  );
}

function ForexPreview() {
  return (
    <div className="services-bento-preview services-bento-preview-forex">
      <div className="services-bento-preview-glass" aria-hidden />
      <div className="services-bento-preview-rate-card">
        <span className="services-bento-preview-rate-label">Live rate</span>
        <div className="services-bento-preview-rate-row">
          <span>USD</span>
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
          <strong>83.42</strong>
        </div>
        <div className="services-bento-preview-rate-row services-bento-preview-rate-muted">
          <span>EUR</span>
          <strong>89.15</strong>
        </div>
      </div>
    </div>
  );
}

function PreparationPreview() {
  return (
    <div className="services-bento-preview services-bento-preview-prep">
      <div className="services-bento-preview-glass" aria-hidden />
      <div className="services-bento-preview-exams">
        {["IELTS", "TOEFL", "GRE"].map((exam) => (
          <span key={exam} className="services-bento-preview-exam">
            <BookOpen className="h-3 w-3" aria-hidden />
            {exam}
          </span>
        ))}
      </div>
      <span className="services-bento-preview-badge services-bento-preview-badge-amber">
        Trusted coaching partners
      </span>
    </div>
  );
}

function CreditCardPreview() {
  return (
    <div className="services-bento-preview services-bento-preview-credit">
      <div className="services-bento-preview-glass" aria-hidden />
      <div className="services-bento-preview-card-stack">
        <div className="services-bento-preview-card services-bento-preview-card-back" aria-hidden />
        <div className="services-bento-preview-card services-bento-preview-card-front">
          <CreditCard className="h-4 w-4" aria-hidden />
          <span>Build credit abroad</span>
          <strong>No local history</strong>
        </div>
      </div>
    </div>
  );
}

const PREVIEW_BY_SLUG: Record<string, () => ReactElement> = {
  accommodation: AccommodationPreview,
  "blocked-account-gic": BlockedAccountPreview,
  "forex-transfers": ForexPreview,
  "test-preparation": PreparationPreview,
  "credit-cards": CreditCardPreview,
};

export function ServiceCardPreview({ slug }: { slug: string }) {
  const Preview = PREVIEW_BY_SLUG[slug];
  if (!Preview) return null;
  return <Preview />;
}

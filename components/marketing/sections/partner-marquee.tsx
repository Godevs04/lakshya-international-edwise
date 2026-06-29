import { MARKETING_PARTNER_UNIVERSITIES } from "@/lib/constants/marketing/partners";

export function PartnerMarquee() {
  const items = [...MARKETING_PARTNER_UNIVERSITIES, ...MARKETING_PARTNER_UNIVERSITIES];

  return (
    <div className="overflow-hidden" aria-label="Partner universities">
      <div className="marquee-track gap-8">
        {items.map((partner, index) => (
          <div
            key={`${partner.name}-${index}`}
            className="flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-white/80 px-4 py-2 text-sm font-medium text-secondary/80"
          >
            <span className="text-xs text-primary">{partner.country}</span>
            {partner.name}
          </div>
        ))}
      </div>
    </div>
  );
}

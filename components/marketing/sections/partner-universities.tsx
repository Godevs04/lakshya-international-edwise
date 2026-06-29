import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MARKETING_PARTNER_UNIVERSITIES } from "@/lib/constants/marketing/partners";

export function PartnerUniversitiesSection() {
  return (
    <SectionShell
      variant="white"
      eyebrow="University Partners"
      title="320+ partner institutions worldwide"
      description="We work with leading universities across top study destinations."
      align="center"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {MARKETING_PARTNER_UNIVERSITIES.map((partner) => (
          <div
            key={partner.name}
            className="card-premium flex flex-col items-center justify-center p-4 text-center"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              {partner.country}
            </span>
            <p className="mt-1 text-xs font-medium leading-snug text-secondary/80">{partner.name}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

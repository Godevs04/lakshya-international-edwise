"use client";

import { SectionShell } from "@/components/marketing/sections/section-shell";
import { ServicesBentoGrid } from "@/components/marketing/homepage/services-bento-grid";

interface PremiumServicesSectionProps {
  showHeading?: boolean;
}

export function PremiumServicesSection({ showHeading = true }: PremiumServicesSectionProps) {
  return (
    <SectionShell
      variant="white"
      background="grid"
      eyebrow={showHeading ? "Our Services" : undefined}
      title={showHeading ? "Everything you need to fund your education abroad" : undefined}
      description={
        showHeading
          ? "One finance partner for loans, forex, blocked accounts, and more — so you can focus on your studies."
          : undefined
      }
      containerClassName="max-w-[90rem]"
      className="services-section-premium"
    >
      <div className="services-bento-bg-orbs" aria-hidden>
        <span className="services-bento-bg-orb services-bento-bg-orb-1" />
        <span className="services-bento-bg-orb services-bento-bg-orb-2" />
        <span className="services-bento-bg-orb services-bento-bg-orb-3" />
      </div>
      <ServicesBentoGrid />
    </SectionShell>
  );
}

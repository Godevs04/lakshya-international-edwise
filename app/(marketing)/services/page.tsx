import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/sections/page-hero";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { ServiceCard } from "@/components/marketing/cards/marketing-cards";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { MARKETING_SERVICES } from "@/lib/constants/marketing/services";
import { getMarketingContact } from "@/lib/config/marketing";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return buildMarketingMetadata({
    title: `Our Services | ${contact.companyName}`,
    description:
      "Education loans, forex & transfers, blocked accounts & GIC, test preparation, accommodation, and student credit cards — everything you need to fund studying abroad.",
    path: "/services",
  });
}

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="Everything you need to fund your education abroad"
        description="One finance partner for loans, forex, blocked accounts, and more — with a single Check Eligibility form."
      />
      <SectionShell variant="white" padding>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MARKETING_SERVICES.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </SectionShell>
      <CtaBanner />
    </>
  );
}

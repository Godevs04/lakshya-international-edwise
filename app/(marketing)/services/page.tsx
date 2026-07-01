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
    title: `Services | ${contact.companyName}`,
    description:
      "Study abroad counselling, education loans, visa assistance, scholarships, SOP review, and university admissions support in India.",
    path: "/services",
  });
}

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Comprehensive support for your global education journey"
        description="From profile assessment to loan disbursement, our team supports every milestone."
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

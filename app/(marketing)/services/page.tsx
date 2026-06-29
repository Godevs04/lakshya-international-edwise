import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/sections/section-heading";
import { ServiceCard } from "@/components/marketing/cards/marketing-cards";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { MARKETING_SERVICES } from "@/lib/constants/marketing/services";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return {
    title: `Services | ${contact.companyName}`,
    description: "Study abroad counselling, education loans, visa assistance, scholarships, and more.",
    alternates: { canonical: `${getSiteUrl()}/services` },
  };
}

export default function ServicesPage() {
  return (
    <>
      <section className="hero-gradient section-padding">
        <div className="container mx-auto max-w-4xl px-4">
          <SectionHeading
            eyebrow="Services"
            title="Comprehensive support for your global education journey"
            description="From profile assessment to loan disbursement, our team supports every milestone."
          />
        </div>
      </section>
      <section className="section-padding">
        <div className="container mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {MARKETING_SERVICES.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>
      <CtaBanner />
    </>
  );
}

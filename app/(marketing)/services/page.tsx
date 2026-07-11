import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/sections/page-hero";
import { PremiumServicesSection } from "@/components/marketing/sections/premium-services-section";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
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
        title="Everything you need"
        titleAccent="to fund your education abroad"
        description="One finance partner for loans, forex, blocked accounts, and more — with a single Check Eligibility form."
      />
      <PremiumServicesSection showHeading={false} />
      <CtaBanner />
    </>
  );
}

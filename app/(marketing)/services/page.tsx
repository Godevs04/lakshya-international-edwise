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
        title="Everything You Need"
        titleAccent="To Fund Your Education Abroad"
        description="One finance partner for loans, forex, blocked accounts, and more — with a single Check Eligibility form."
        decorativeLottie="globe-orbit"
      />
      <PremiumServicesSection showHeading={false} />
      <CtaBanner />
    </>
  );
}

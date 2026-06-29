import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/sections/section-heading";
import { CountryCard } from "@/components/marketing/cards/marketing-cards";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { MARKETING_COUNTRIES } from "@/lib/constants/marketing/countries";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return {
    title: `Study Destinations | ${contact.companyName}`,
    description: "Explore top study abroad destinations including USA, Canada, UK, Australia, and Europe.",
    alternates: { canonical: `${getSiteUrl()}/countries` },
  };
}

export default function CountriesPage() {
  return (
    <>
      <section className="hero-gradient section-padding">
        <div className="container mx-auto max-w-4xl px-4">
          <SectionHeading
            eyebrow="Countries"
            title="Choose the right country for your goals"
            description="Compare destinations, costs, visa pathways, and career outcomes with expert guidance."
          />
        </div>
      </section>
      <section className="section-padding">
        <div className="container mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {MARKETING_COUNTRIES.map((country) => (
            <CountryCard key={country.slug} country={country} />
          ))}
        </div>
      </section>
      <CtaBanner />
    </>
  );
}

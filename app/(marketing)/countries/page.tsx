import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/sections/page-hero";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { CountryCard } from "@/components/marketing/cards/marketing-cards";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { MARKETING_COUNTRIES } from "@/lib/constants/marketing/countries";
import { getMarketingContact } from "@/lib/config/marketing";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return buildMarketingMetadata({
    title: `Education Loans by Country | ${contact.companyName}`,
    description:
      "Country-specific education loan guidance for the USA, Canada, UK, Germany, Australia, and more — with visa financial requirements and lender options.",
    path: "/countries",
  });
}

export default function CountriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Countries"
        title="Fund your education"
        titleAccent="in every top destination"
        description="Compare loan options, visa financial requirements, and typical costs for each country."
        stats={[
          { label: "Countries covered", value: MARKETING_COUNTRIES.length },
          { label: "Students guided", value: 8500, suffix: "+" },
        ]}
        decorativeLottie="globe-orbit"
      />
      <SectionShell variant="muted" background="map" padding containerClassName="max-w-[90rem]">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MARKETING_COUNTRIES.map((country) => (
            <CountryCard key={country.slug} country={country} />
          ))}
        </div>
      </SectionShell>
      <CtaBanner />
    </>
  );
}

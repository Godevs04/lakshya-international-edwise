import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/marketing/sections/section-heading";
import { LeadForm } from "@/components/marketing/forms/lead-form";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { getMarketingCountry, MARKETING_COUNTRIES } from "@/lib/constants/marketing/countries";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";

export function generateStaticParams() {
  return MARKETING_COUNTRIES.map((country) => ({ slug: country.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const country = getMarketingCountry(slug);
  const contact = getMarketingContact();
  if (!country) return { title: contact.companyName };
  return {
    title: `Study in ${country.name} | ${contact.companyName}`,
    description: country.shortDescription,
    alternates: { canonical: `${getSiteUrl()}/countries/${slug}` },
  };
}

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const country = getMarketingCountry(slug);
  if (!country) notFound();

  return (
    <>
      <section className="hero-gradient section-padding">
        <div className="container mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">{country.flag}</p>
            <SectionHeading title={`Study in ${country.name}`} description={country.description} />
          </div>
          <LeadForm variant="country" formPage={`/countries/${slug}`} defaultCountry={country.name} />
        </div>
      </section>

      <section className="section-padding">
        <div className="container mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2">
          <InfoBlock title="Key benefits" items={country.benefits} />
          <InfoBlock title="Top universities" items={country.universities} />
          <InfoBlock title="Cost of study" items={[country.costOfStudy]} />
          <InfoBlock title="Visa overview" items={[country.visaInfo]} />
          <InfoBlock title="Career outlook" items={[country.careerOutlook]} className="md:col-span-2" />
        </div>
      </section>

      <CtaBanner title={`Start your ${country.name} application today`} />
    </>
  );
}

function InfoBlock({
  title,
  items,
  className,
}: {
  title: string;
  items: string[];
  className?: string;
}) {
  return (
    <div className={`glass-card rounded-2xl p-5 ${className ?? ""}`}>
      <h2 className="text-lg font-semibold text-secondary">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeadForm } from "@/components/marketing/forms/lead-form";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { getMarketingCountry, getCountryFlagLabel, MARKETING_COUNTRIES } from "@/lib/constants/marketing/countries";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";
import { cn } from "@/lib/utils";

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
    <div className={cn("card-premium p-5", className)}>
      <h2 className="text-lg font-semibold text-secondary">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
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
        <div className="container mx-auto grid max-w-6xl items-start gap-8 px-4 lg:grid-cols-2">
          <div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
              {getCountryFlagLabel(country)}
            </span>
            <h1 className="heading-display mt-4 text-secondary">Study in {country.name}</h1>
            <p className="prose-marketing mt-5 text-lg text-muted-foreground">{country.description}</p>
          </div>
          <LeadForm
            variant="country"
            formPage={`/countries/${slug}`}
            defaultCountry={country.name}
            premium
          />
        </div>
      </section>

      <SectionShell variant="muted" padding>
        <div className="grid gap-6 md:grid-cols-2">
          <InfoBlock title="Key benefits" items={country.benefits} />
          <InfoBlock title="Top universities" items={country.universities} />
          <InfoBlock title="Cost of study" items={[country.costOfStudy]} />
          <InfoBlock title="Visa overview" items={[country.visaInfo]} />
          {country.popularCourses && country.popularCourses.length > 0 && (
            <InfoBlock title="Popular courses" items={country.popularCourses} />
          )}
          <InfoBlock title="Career outlook" items={[country.careerOutlook]} className="md:col-span-2" />
        </div>
      </SectionShell>

      <CtaBanner title={`Start your ${country.name} application today`} />
    </>
  );
}

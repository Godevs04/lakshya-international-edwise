import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { getMarketingCountry, getCountryFlagLabel, MARKETING_COUNTRIES } from "@/lib/constants/marketing/countries";
import { getMarketingContact } from "@/lib/config/marketing";
import { buildMarketingMetadata, getAbsoluteUrl } from "@/lib/seo/marketing-metadata";
import { JsonLd, breadcrumbJsonLd, serviceJsonLd } from "@/components/marketing/seo/json-ld";
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
  return buildMarketingMetadata({
    title: `${country.name} Education Loan | ${contact.companyName}`,
    description: `Education loans for studying in ${country.name} — ${country.shortDescription}`,
    path: `/countries/${slug}`,
  });
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

  const contact = getMarketingContact();
  const countryUrl = getAbsoluteUrl(`/countries/${slug}`);

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd({
            name: `${country.name} Education Loan`,
            description: country.shortDescription,
            url: countryUrl,
            provider: contact.companyName,
          }),
          breadcrumbJsonLd([
            { name: "Home", url: getAbsoluteUrl("/") },
            { name: "Countries", url: getAbsoluteUrl("/countries") },
            { name: country.name, url: countryUrl },
          ]),
        ]}
      />
      <section className="hero-gradient section-padding">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-base font-bold text-primary">
            {getCountryFlagLabel(country)}
          </span>
          <h1 className="heading-display mt-4 text-foreground">
            Education loans for {country.name}
          </h1>
          <p className="prose-marketing mx-auto mt-5 text-lg text-muted-foreground">
            {country.description}
          </p>
          <div className="mt-8">
            <EligibilityCta source={`country-${slug}`} className="px-7 py-3.5 text-base" />
          </div>
        </div>
      </section>

      <SectionShell variant="muted" padding>
        <div className="grid gap-6 md:grid-cols-2">
          <InfoBlock title="Why fund with Lakshya" items={country.benefits} />
          <InfoBlock
            title="Typical cost of study"
            items={[
              country.tuitionRange ?? country.costOfStudy,
              country.livingCost ? `Living: ${country.livingCost}` : country.costOfStudy,
            ].filter(Boolean)}
          />
          <InfoBlock title="Visa financial requirements" items={[country.visaInfo]} />
          {country.visaDuration && (
            <InfoBlock title="Visa type" items={[country.visaDuration]} />
          )}
        </div>
      </SectionShell>

      <CtaBanner
        title={`Check your ${country.name} education loan eligibility`}
        source={`country-${slug}-banner`}
      />
    </>
  );
}

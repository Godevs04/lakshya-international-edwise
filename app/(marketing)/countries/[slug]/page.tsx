import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CountryHero } from "@/components/marketing/sections/country-hero";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { getMarketingCountry, MARKETING_COUNTRIES } from "@/lib/constants/marketing/countries";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";
import { buildMarketingMetadata, getAbsoluteUrl } from "@/lib/seo/marketing-metadata";
import {
  JsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  serviceJsonLd,
} from "@/components/marketing/seo/json-ld";
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

  const title = country.seoTitle
    ? `${country.seoTitle} | ${contact.companyName}`
    : `${country.name} Education Loan | ${contact.companyName}`;
  const description =
    country.seoDescription ??
    `Education loans for studying in ${country.name} — ${country.shortDescription}. Guided by ${contact.companyName}.`;

  return buildMarketingMetadata({
    title,
    description,
    path: `/countries/${slug}`,
    keywords: [
      ...(country.keywords ?? []),
      `${country.name} education loan`,
      `education loan for ${country.name}`,
      "Lakshya International Edwise",
      "overseas education loan",
    ],
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
  const siteUrl = getSiteUrl();
  const countryUrl = getAbsoluteUrl(`/countries/${slug}`);

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd({
            name: country.seoTitle ?? `${country.name} Education Loan`,
            description: country.seoDescription ?? country.description,
            url: countryUrl,
            provider: contact.companyName,
            providerUrl: siteUrl,
            areaServed: [country.name, "India"],
          }),
          breadcrumbJsonLd([
            { name: "Home", url: getAbsoluteUrl("/") },
            { name: "Countries", url: getAbsoluteUrl("/countries") },
            { name: country.name, url: countryUrl },
          ]),
          ...(country.faqs?.length ? [faqPageJsonLd(country.faqs)] : []),
        ]}
      />
      <CountryHero country={country} slug={slug} />

      {country.answerSummary ? (
        <SectionShell variant="white" padding className="page-section-premium">
          <article className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold text-secondary">
              Quick answer: funding study in {country.name}
            </h2>
            <p className="prose-marketing mt-4 text-base leading-relaxed text-muted-foreground">
              {country.answerSummary}
            </p>
          </article>
        </SectionShell>
      ) : null}

      <SectionShell variant="muted" padding className="page-section-premium" background="grid">
        <div className="grid gap-6 md:grid-cols-2">
          <InfoBlock title="Why fund with Lakshya International Edwise" items={country.benefits} />
          <InfoBlock
            title="Typical cost of study"
            items={[
              country.tuitionRange ?? country.costOfStudy,
              country.livingCost ? `Living: ${country.livingCost}` : country.costOfStudy,
            ].filter(Boolean)}
          />
          <InfoBlock title="Visa financial requirements" items={[country.visaInfo]} />
          {country.visaDuration ? (
            <InfoBlock title="Visa type" items={[country.visaDuration]} />
          ) : null}
          {country.universities.length > 0 ? (
            <InfoBlock title="Popular universities" items={country.universities} />
          ) : null}
          {country.careerOutlook ? (
            <InfoBlock title="Career outlook" items={[country.careerOutlook]} />
          ) : null}
        </div>
      </SectionShell>

      {country.loanGuide && country.loanGuide.length > 0 ? (
        <SectionShell
          variant="white"
          padding
          className="page-section-premium"
          eyebrow="Loan guide"
          title={`${country.name} education loan essentials`}
          description={`What Indian students should know before applying for an education loan for ${country.name}.`}
        >
          <ol className="mx-auto max-w-3xl space-y-4">
            {country.loanGuide.map((item, index) => (
              <li key={item} className="card-premium flex gap-4 p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
              </li>
            ))}
          </ol>
        </SectionShell>
      ) : null}

      {country.faqs && country.faqs.length > 0 ? (
        <SectionShell
          variant="muted"
          padding
          className="page-section-premium"
          eyebrow="FAQ"
          title={`${country.name} education loan FAQs`}
          description="Common questions students ask before applying."
        >
          <div className="mx-auto max-w-3xl space-y-4">
            {country.faqs.map((faq) => (
              <article key={faq.question} className="card-premium p-5">
                <h3 className="text-base font-semibold text-secondary">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </article>
            ))}
          </div>
        </SectionShell>
      ) : null}

      <CtaBanner
        title={`Check your ${country.name} education loan eligibility`}
        source={`country-${slug}-banner`}
        targetCountry={country.name}
      />
    </>
  );
}

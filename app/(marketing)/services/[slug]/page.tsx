import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { getMarketingService, MARKETING_SERVICES } from "@/lib/constants/marketing/services";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import { getMarketingContact } from "@/lib/config/marketing";
import { buildMarketingMetadata, getAbsoluteUrl } from "@/lib/seo/marketing-metadata";
import { JsonLd, breadcrumbJsonLd, serviceJsonLd } from "@/components/marketing/seo/json-ld";

export function generateStaticParams() {
  return MARKETING_SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getMarketingService(slug);
  const contact = getMarketingContact();
  if (!service) return { title: contact.companyName };
  return buildMarketingMetadata({
    title: `${service.title} | ${contact.companyName}`,
    description: service.shortDescription,
    path: `/services/${slug}`,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getMarketingService(slug);
  if (!service) notFound();

  const contact = getMarketingContact();
  const serviceUrl = getAbsoluteUrl(`/services/${slug}`);

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd({
            name: service.title,
            description: service.description,
            url: serviceUrl,
            provider: contact.companyName,
          }),
          breadcrumbJsonLd([
            { name: "Home", url: getAbsoluteUrl("/") },
            { name: "Services", url: getAbsoluteUrl("/services") },
            { name: service.title, url: serviceUrl },
          ]),
        ]}
      />
      <section className="hero-gradient section-padding">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MarketingIcon name={service.icon} className="h-7 w-7" />
          </div>
          <h1 className="heading-display text-foreground">{service.title}</h1>
          <p className="prose-marketing mx-auto mt-5 text-lg text-muted-foreground">
            {service.description}
          </p>
          <div className="mt-8">
            <EligibilityCta source={`service-${slug}`} className="px-7 py-3.5 text-base" />
          </div>
        </div>
      </section>

      <SectionShell variant="white" title="What you get" eyebrow="Highlights" align="center">
        <ul className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
          {service.highlights.map((item) => (
            <li key={item} className="card-premium flex items-center gap-3 px-4 py-3 text-sm text-foreground">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
              {item}
            </li>
          ))}
        </ul>
      </SectionShell>

      <CtaBanner source={`service-${slug}-banner`} />
    </>
  );
}

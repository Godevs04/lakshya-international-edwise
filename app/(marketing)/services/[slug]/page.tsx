import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { LeadForm } from "@/components/marketing/forms/lead-form";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { getMarketingService, MARKETING_SERVICES } from "@/lib/constants/marketing/services";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";

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
  return {
    title: `${service.title} | ${contact.companyName}`,
    description: service.shortDescription,
    alternates: { canonical: `${getSiteUrl()}/services/${slug}` },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getMarketingService(slug);
  if (!service) notFound();

  return (
    <>
      <section className="hero-gradient section-padding">
        <div className="container mx-auto grid max-w-6xl items-start gap-8 px-4 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MarketingIcon name={service.icon} className="h-6 w-6" />
            </div>
            <h1 className="heading-display text-secondary">{service.title}</h1>
            <p className="prose-marketing mt-5 text-lg text-muted-foreground">{service.description}</p>
          </div>
          <LeadForm variant="consultation" formPage={`/services/${slug}`} premium />
        </div>
      </section>

      <SectionShell variant="white" title="What we cover" eyebrow="Highlights">
        <ul className="grid gap-3 sm:grid-cols-2">
          {service.highlights.map((item) => (
            <li key={item} className="card-premium px-4 py-3 text-sm text-secondary/90">
              {item}
            </li>
          ))}
        </ul>
      </SectionShell>

      <CtaBanner />
    </>
  );
}

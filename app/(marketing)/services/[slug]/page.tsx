import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/marketing/sections/section-heading";
import { LeadForm } from "@/components/marketing/forms/lead-form";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { getMarketingService, MARKETING_SERVICES } from "@/lib/constants/marketing/services";
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
        <div className="container mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-2">
          <SectionHeading title={service.title} description={service.description} />
          <LeadForm variant="consultation" formPage={`/services/${slug}`} />
        </div>
      </section>
      <section className="section-padding">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-2xl font-bold text-secondary">What we cover</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {service.highlights.map((item) => (
              <li key={item} className="glass-card rounded-xl px-4 py-3 text-sm text-secondary/90">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBanner />
    </>
  );
}

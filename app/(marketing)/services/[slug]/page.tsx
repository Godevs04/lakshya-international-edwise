import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/marketing/sections/page-hero";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { getMarketingService, MARKETING_SERVICES } from "@/lib/constants/marketing/services";
import { EducationLoanOptionsSection } from "@/components/marketing/services/education-loan-options-section";
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

  if (slug === "education-loan") {
    return buildMarketingMetadata({
      title: `Overseas Education Loan in India | ${contact.companyName}`,
      description:
        "Compare overseas education loans from 20+ banks and NBFCs with Lakshya International Edwise. Collateral, non-collateral, and non-cosigner options for USA, UK, Canada, Ireland, Germany, and UAE/Dubai.",
      path: `/services/${slug}`,
      keywords: [
        "overseas education loan",
        "education loan India",
        "student loan for international students",
        "non collateral education loan",
        "education loan without cosigner",
        "Lakshya International Edwise",
      ],
    });
  }

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
            providerUrl: getAbsoluteUrl("/"),
          }),
          breadcrumbJsonLd([
            { name: "Home", url: getAbsoluteUrl("/") },
            { name: "Services", url: getAbsoluteUrl("/services") },
            { name: service.title, url: serviceUrl },
          ]),
        ]}
      />
      <PageHero
        align="center"
        icon={
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            <MarketingIcon name={service.icon} className="h-7 w-7" />
          </div>
        }
        title={service.title}
        description={service.description}
      >
        <EligibilityCta source={`service-${slug}`} className="px-7 py-3.5 text-base" />
      </PageHero>

      {service.subOptions && service.subOptions.length > 0 && (
        <SectionShell
          variant="muted"
          background="grid"
          eyebrow="Loan Types"
          title="Choose the right education loan for your profile"
          description="Compare non-cosigner, cosigner, collateral, and non-collateral options — we match you with the best lender."
          align="center"
        >
          <EducationLoanOptionsSection options={service.subOptions} />
        </SectionShell>
      )}

      <SectionShell
        variant="white"
        background="grid"
        title="What you get"
        eyebrow="Highlights"
        align="center"
        className="page-section-premium"
      >
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

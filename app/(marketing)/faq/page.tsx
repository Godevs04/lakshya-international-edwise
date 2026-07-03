import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/sections/page-hero";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { FaqSearch } from "@/components/marketing/sections/faq-search";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { JsonLd, faqPageJsonLd, breadcrumbJsonLd } from "@/components/marketing/seo/json-ld";
import { MARKETING_FAQS } from "@/lib/constants/marketing/faqs";
import { getMarketingContact } from "@/lib/config/marketing";
import { buildMarketingMetadata, getAbsoluteUrl } from "@/lib/seo/marketing-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return buildMarketingMetadata({
    title: `FAQ | ${contact.companyName}`,
    description:
      "Answers to common questions about education loans, eligibility, interest rates, no-collateral options, approval times, and funding your studies abroad.",
    path: "/faq",
  });
}

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={[
          faqPageJsonLd(MARKETING_FAQS),
          breadcrumbJsonLd([
            { name: "Home", url: getAbsoluteUrl("/") },
            { name: "FAQ", url: getAbsoluteUrl("/faq") },
          ]),
        ]}
      />
      <PageHero
        eyebrow="FAQ"
        title="Education loan questions, answered"
        description="Everything you need to know about eligibility, rates, approvals, and funding your global education."
      />
      <SectionShell variant="white">
        <FaqSearch items={MARKETING_FAQS} />
      </SectionShell>
      <CtaBanner source="faq-banner" />
    </>
  );
}

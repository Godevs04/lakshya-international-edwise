import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { FinanceHero } from "@/components/marketing/sections/finance-hero";
import { FinanceServicesGrid } from "@/components/marketing/sections/finance-services-grid";
import { AboutPreviewSection } from "@/components/marketing/sections/about-preview-section";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { CountryCard } from "@/components/marketing/cards/country-card";
import { FaqSection } from "@/components/marketing/sections/faq";
import { WhyChooseSection } from "@/components/marketing/sections/why-choose";
import { HomepageJourneyPath } from "@/components/marketing/motion/homepage-journey-path";
import { JsonLd, faqPageJsonLd, websiteJsonLd } from "@/components/marketing/seo/json-ld";
import { MARKETING_COUNTRIES } from "@/lib/constants/marketing/countries";
import { MARKETING_FAQS } from "@/lib/constants/marketing/faqs";
import {
  WHAT_LAKSHYA_ACCEPTS,
  WHAT_LAKSHYA_GIVES_BACK,
} from "@/lib/constants/marketing/lakshya-value-props";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

const FinanceProcessHorizontal = dynamic(
  () =>
    import("@/components/marketing/sections/finance-process-horizontal").then(
      (mod) => mod.FinanceProcessHorizontal
    ),
  { ssr: true }
);

const LakshyaRootMap = dynamic(
  () =>
    import("@/components/marketing/sections/lakshya-root-map").then((mod) => mod.LakshyaRootMap),
  { ssr: true }
);

const ValuePropsGrid = dynamic(
  () =>
    import("@/components/marketing/sections/value-props-grid").then((mod) => mod.ValuePropsGrid),
  { ssr: true }
);

const LendingPartnersPreview = dynamic(
  () =>
    import("@/components/marketing/sections/lending-partners-preview").then(
      (mod) => mod.LendingPartnersPreview
    ),
  { ssr: true }
);

const LoanCalculatorSection = dynamic(
  () =>
    import("@/components/marketing/sections/loan-calculator-section").then(
      (mod) => mod.LoanCalculatorSection
    ),
  { ssr: true }
);

const TestimonialsSection = dynamic(
  () =>
    import("@/components/marketing/sections/testimonials").then((mod) => mod.TestimonialsSection),
  { ssr: true }
);

const CtaBanner = dynamic(
  () => import("@/components/marketing/sections/cta-banner").then((mod) => mod.CtaBanner),
  { ssr: true }
);

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return buildMarketingMetadata({
    title: `${contact.companyName} | Overseas Education Loan Experts`,
    description:
      "Lakshya International Edwise — overseas education loan experts in India. Fund USA, UK, Canada, Ireland, Germany, Australia, and UAE/Dubai studies with 20+ lenders, non-collateral options, and 73-hour processing.",
    path: "/",
    absoluteTitle: true,
    keywords: [
      "Lakshya International Edwise",
      "Lakshya Edwise",
      "overseas education loan",
      "education loan India",
      "student loan for international students",
      "education finance UAE",
      "student loan Dubai",
      "education loan for Ireland",
      "education loan for Canada",
    ],
  });
}

export default function MarketingHomePage() {
  const contact = getMarketingContact();
  const siteUrl = getSiteUrl();

  return (
    <>
      <JsonLd
        data={[
          websiteJsonLd({
            name: contact.companyName,
            url: siteUrl,
          }),
          faqPageJsonLd(MARKETING_FAQS),
        ]}
      />

      <HomepageJourneyPath />
      <FinanceHero />
      <LoanCalculatorSection />
      <LakshyaRootMap />
      <FinanceProcessHorizontal />
      <WhyChooseSection />

      <ValuePropsGrid
        eyebrow="What Lakshya Accepts"
        title="Rejected elsewhere? We still say yes."
        description="Low CIBIL, no guarantor, gap years — we work with lenders who look at the whole picture."
        items={WHAT_LAKSHYA_ACCEPTS}
        variant="white"
        ctaSource="accepts-grid"
      />

      <ValuePropsGrid
        eyebrow="What Lakshya Gives Back"
        title="More than a loan — real value for students"
        description="Lower rates, fee waivers, and end-to-end support that saves you time and money."
        items={WHAT_LAKSHYA_GIVES_BACK}
        variant="accent"
        ctaSource="gives-back-grid"
      />

      <FinanceServicesGrid />

      <SectionShell
        variant="muted"
        background="map"
        journeyNode="countries"
        eyebrow="Countries"
        title="Education loans for every top destination"
        description="Country-specific loan guidance, visa financials, and lender options."
        containerClassName="max-w-[90rem]"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MARKETING_COUNTRIES.slice(0, 6).map((country) => (
            <CountryCard key={country.slug} country={country} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/countries" className="text-sm font-semibold text-primary hover:underline">
            Explore all countries
          </Link>
        </div>
      </SectionShell>

      <LendingPartnersPreview />
      <AboutPreviewSection />
      <TestimonialsSection />
      <FaqSection items={MARKETING_FAQS.slice(0, 6)} />
      <CtaBanner />
    </>
  );
}

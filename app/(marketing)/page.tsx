import type { Metadata } from "next";
import Link from "next/link";
import { FinanceHero } from "@/components/marketing/sections/finance-hero";
import { TrustMetricsBar } from "@/components/marketing/sections/trust-metrics-bar";
import { LenderLogoCarousel } from "@/components/marketing/sections/lender-logo-carousel";
import { FinanceServicesGrid } from "@/components/marketing/sections/finance-services-grid";
import { FinanceProcessHorizontal } from "@/components/marketing/sections/finance-process-horizontal";
import { LakshyaRootMap } from "@/components/marketing/sections/lakshya-root-map";
import { ValuePropsGrid } from "@/components/marketing/sections/value-props-grid";
import { AboutJourneySection } from "@/components/marketing/sections/about-journey-section";
import { LendingPartnersPreview } from "@/components/marketing/sections/lending-partners-preview";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { CountryCard } from "@/components/marketing/cards/country-card";
import { TestimonialsSection } from "@/components/marketing/sections/testimonials";
import { FaqSection } from "@/components/marketing/sections/faq";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
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

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return buildMarketingMetadata({
    title: `${contact.companyName} | Overseas Education Loan Experts`,
    description:
      "Fund your global education with the lowest interest education loan from 20+ trusted lenders. Non-collateral options, 73-hour approvals, up to ₹2 Cr, 100% cost coverage.",
    path: "/",
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
            searchUrl: `${siteUrl}/services`,
          }),
          faqPageJsonLd(MARKETING_FAQS),
        ]}
      />

      <HomepageJourneyPath />
      <FinanceHero />
      <TrustMetricsBar />
      <LenderLogoCarousel />
      <FinanceServicesGrid />
      <FinanceProcessHorizontal />
      <LakshyaRootMap />

      <ValuePropsGrid
        eyebrow="What Lakshya Accepts"
        title="Rejected elsewhere? We still say yes."
        description="Low CIBIL, no co-signer, gap years — we work with lenders who look at the whole picture."
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

      <SectionShell
        variant="muted"
        background="map"
        journeyNode="countries"
        eyebrow="Countries"
        title="Education loans for every top destination"
        description="Country-specific loan guidance, visa financials, and lender options."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      <AboutJourneySection />
      <TestimonialsSection />
      <FaqSection items={MARKETING_FAQS.slice(0, 6)} />
      <CtaBanner />
    </>
  );
}

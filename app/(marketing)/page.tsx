import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHero } from "@/components/marketing/sections/hero";
import { StatsBar } from "@/components/marketing/sections/stats-bar";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { TestimonialsSection } from "@/components/marketing/sections/testimonials";
import { FaqSection } from "@/components/marketing/sections/faq";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { ServiceCard, BlogCard } from "@/components/marketing/cards/marketing-cards";
import { CountryCard } from "@/components/marketing/cards/country-card";
import { WhyChooseSection } from "@/components/marketing/sections/why-choose";
import { ProcessTimelineSection } from "@/components/marketing/sections/process-timeline";
import { PartnerUniversitiesSection } from "@/components/marketing/sections/partner-universities";
import { BankingPartnersSection } from "@/components/marketing/sections/banking-partners";
import { GoogleReviewsSection } from "@/components/marketing/sections/google-reviews";
import { OfficeHighlightsSection } from "@/components/marketing/sections/office-highlights";
import { JsonLd, faqPageJsonLd, websiteJsonLd } from "@/components/marketing/seo/json-ld";
import { MARKETING_SERVICES } from "@/lib/constants/marketing/services";
import { MARKETING_COUNTRIES } from "@/lib/constants/marketing/countries";
import { MARKETING_FAQS } from "@/lib/constants/marketing/faqs";
import { getAllBlogPosts } from "@/lib/blog";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return buildMarketingMetadata({
    title: `${contact.companyName} | Study Abroad Consultancy India & Education Loans`,
    description:
      "Premium study abroad counselling, visa assistance, scholarships, and education loan support for students in India. Trusted guidance for Canada, UK, Australia, and more.",
    path: "/",
  });
}

export default function MarketingHomePage() {
  const latestPosts = getAllBlogPosts().slice(0, 3);
  const contact = getMarketingContact();
  const siteUrl = getSiteUrl();

  return (
    <>
      <JsonLd
        data={[
          websiteJsonLd({
            name: contact.companyName,
            url: siteUrl,
            searchUrl: `${siteUrl}/blog`,
          }),
          faqPageJsonLd(MARKETING_FAQS),
        ]}
      />
      <MarketingHero />
      <PartnerUniversitiesSection />
      <StatsBar />

      <SectionShell
        variant="white"
        eyebrow="Services"
        title="Everything you need to study abroad with confidence"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MARKETING_SERVICES.slice(0, 4).map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/services" className="text-sm font-semibold text-primary hover:underline">
            View all services
          </Link>
        </div>
      </SectionShell>

      <WhyChooseSection />

      <SectionShell variant="muted" eyebrow="Destinations" title="Top study abroad destinations">
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

      <ProcessTimelineSection />
      <BankingPartnersSection />
      <TestimonialsSection />
      <GoogleReviewsSection />
      <OfficeHighlightsSection />

      {latestPosts.length > 0 && (
        <SectionShell variant="white" eyebrow="Blog" title="Latest insights">
          <div className="grid gap-4 md:grid-cols-3">
            {latestPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/blog" className="text-sm font-semibold text-primary hover:underline">
              Read all articles
            </Link>
          </div>
        </SectionShell>
      )}

      <FaqSection items={MARKETING_FAQS} />
      <CtaBanner />
    </>
  );
}

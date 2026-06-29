import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHero } from "@/components/marketing/sections/hero";
import { StatsBar } from "@/components/marketing/sections/stats-bar";
import { SectionHeading } from "@/components/marketing/sections/section-heading";
import { TestimonialsSection } from "@/components/marketing/sections/testimonials";
import { FaqSection } from "@/components/marketing/sections/faq";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { ServiceCard, CountryCard, BlogCard } from "@/components/marketing/cards/marketing-cards";
import { MARKETING_SERVICES } from "@/lib/constants/marketing/services";
import { MARKETING_COUNTRIES } from "@/lib/constants/marketing/countries";
import { MARKETING_FAQS } from "@/lib/constants/marketing/faqs";
import { MARKETING_LENDERS } from "@/lib/constants/marketing/lenders";
import { getAllBlogPosts } from "@/lib/blog";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";
import Image from "next/image";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return {
    title: `${contact.companyName} | Study Abroad & Education Loans`,
    description:
      "Premium study abroad counselling, visa assistance, scholarships, and education loan support for students in India.",
    alternates: { canonical: getSiteUrl() },
    openGraph: {
      title: `${contact.companyName} | Study Abroad & Education Loans`,
      description: "Your trusted partner for global education and loan facilitation.",
      url: getSiteUrl(),
      type: "website",
    },
  };
}

export default function MarketingHomePage() {
  const latestPosts = getAllBlogPosts().slice(0, 3);

  return (
    <>
      <MarketingHero />
      <StatsBar />

      <section className="section-padding">
        <div className="container mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="Services"
            title="Everything you need to study abroad with confidence"
            className="mb-8"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MARKETING_SERVICES.slice(0, 4).map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/services" className="text-sm font-semibold text-primary hover:underline">
              View all services
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted/20">
        <div className="container mx-auto max-w-6xl px-4">
          <SectionHeading eyebrow="Destinations" title="Top study abroad destinations" className="mb-8" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {MARKETING_COUNTRIES.slice(0, 5).map((country) => (
              <CountryCard key={country.slug} country={country} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="Education Loans"
            title="Partner with leading education loan providers"
            description="Compare lenders, understand eligibility, and track sanction to disbursement with expert support."
            className="mb-8"
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {MARKETING_LENDERS.map((lender) => (
              <div key={lender.slug} className="glass-card flex items-center justify-center rounded-2xl p-4">
                <Image src={lender.logo} alt={lender.name} width={120} height={32} className="h-8 w-auto object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />

      {latestPosts.length > 0 && (
        <section className="section-padding">
          <div className="container mx-auto max-w-6xl px-4">
            <SectionHeading eyebrow="Blog" title="Latest insights" className="mb-8" />
            <div className="grid gap-4 md:grid-cols-3">
              {latestPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      <FaqSection items={MARKETING_FAQS} />
      <CtaBanner />
    </>
  );
}

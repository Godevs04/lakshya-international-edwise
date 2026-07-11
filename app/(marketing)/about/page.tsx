import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/sections/page-hero";
import { AboutJourneySection } from "@/components/marketing/sections/about-journey-section";
import { WhyChooseSection } from "@/components/marketing/sections/why-choose";
import { StatsBar } from "@/components/marketing/sections/stats-bar";
import { ProcessTimelineSection } from "@/components/marketing/sections/process-timeline";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { GalleryGrid } from "@/components/marketing/gallery/gallery-grid";
import { GoogleReviewsSection } from "@/components/marketing/sections/google-reviews";
import { OfficeHighlightsSection } from "@/components/marketing/sections/office-highlights";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { JsonLd, breadcrumbJsonLd } from "@/components/marketing/seo/json-ld";
import { getMarketingContact } from "@/lib/config/marketing";
import { buildMarketingMetadata, getAbsoluteUrl } from "@/lib/seo/marketing-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return buildMarketingMetadata({
    title: `About Us | ${contact.companyName}`,
    description:
      "Learn about Lakshya International Edwise — India's trusted overseas education loan partner with 20+ lenders, 20,000+ students funded, and zero service charges.",
    path: "/about",
  });
}

export default function AboutPage() {
  const contact = getMarketingContact();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: getAbsoluteUrl("/") },
          { name: "About Us", url: getAbsoluteUrl("/about") },
        ])}
      />
      <PageHero
        eyebrow="About Us"
        title={`${contact.companyName}`}
        description="Making global education Affordable, Accessible, and Achievable — with transparent loan comparisons and expert guidance at every step."
      />
      <AboutJourneySection />
      <WhyChooseSection />
      <StatsBar />
      <ProcessTimelineSection />
      <SectionShell
        variant="muted"
        eyebrow="Gallery"
        title="Life at Lakshya"
        description="Counselling sessions, workshops, and student success moments across our offices."
      >
        <GalleryGrid />
      </SectionShell>
      <GoogleReviewsSection />
      <OfficeHighlightsSection />
      <CtaBanner source="about-banner" />
    </>
  );
}

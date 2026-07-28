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
import { ABOUT_PAGE_DESCRIPTION } from "@/lib/constants/marketing/about";
import { getMarketingContact } from "@/lib/config/marketing";
import { buildMarketingMetadata, getAbsoluteUrl } from "@/lib/seo/marketing-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return buildMarketingMetadata({
    title: `About Us | ${contact.companyName}`,
    description: ABOUT_PAGE_DESCRIPTION,
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
        title="Making Global Education"
        titleAccent="Affordable, Accessible, Achievable"
        description={`${contact.companyName} is a partnership firm in India — expert education loan advisory with 20+ banks and NBFCs, end-to-end from profile evaluation to disbursement.`}
        decorativeLottie="about"
        decorativeLottieClassName="page-hero-premium-lottie-about"
        stats={[
          { label: "Students guided", value: 8500, suffix: "+" },
          { label: "Lending partners", value: 20, suffix: "+" },
          { label: "Years of experience", value: 12, suffix: "+" },
        ]}
      />
      <AboutJourneySection companyName={contact.companyName} />
      <WhyChooseSection />
      <StatsBar />
      <ProcessTimelineSection />
      <SectionShell
        variant="muted"
        background="grid"
        eyebrow="Gallery"
        title="Life at Lakshya"
        description="A curated look at counselling sessions, workshops, and student success moments — coming soon."
        className="page-section-premium"
      >
        <GalleryGrid />
      </SectionShell>
      <GoogleReviewsSection />
      <OfficeHighlightsSection />
      <CtaBanner source="about-banner" />
    </>
  );
}

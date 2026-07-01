import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/sections/page-hero";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { GalleryGrid } from "@/components/marketing/gallery/gallery-grid";
import { getMarketingContact } from "@/lib/config/marketing";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return buildMarketingMetadata({
    title: `Gallery | ${contact.companyName}`,
    description:
      "Moments from counselling sessions, university fairs, and student success events at Lakshya International Edwise.",
    path: "/gallery",
  });
}

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Life at our consultancy"
        description="Workshops, counselling sessions, and celebrations with our student community."
      />
      <SectionShell variant="muted" padding>
        <GalleryGrid />
      </SectionShell>
    </>
  );
}

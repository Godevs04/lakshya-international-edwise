import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/sections/page-hero";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { GalleryGrid } from "@/components/marketing/gallery/gallery-grid";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return {
    title: `Gallery | ${contact.companyName}`,
    description: "Moments from counselling sessions, university fairs, and student success events.",
    alternates: { canonical: `${getSiteUrl()}/gallery` },
  };
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

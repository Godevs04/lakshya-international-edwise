import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/sections/section-heading";
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
    <section className="section-padding">
      <div className="container mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Gallery"
          title="Life at Lakshya International Edwise"
          description="Workshops, counselling sessions, and celebrations with our student community."
          className="mb-8"
        />
        <GalleryGrid />
      </div>
    </section>
  );
}

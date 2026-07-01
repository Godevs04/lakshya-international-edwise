import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/sections/page-hero";
import { TestimonialsSection } from "@/components/marketing/sections/testimonials";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { getMarketingContact } from "@/lib/config/marketing";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return buildMarketingMetadata({
    title: `Success Stories | ${contact.companyName}`,
    description:
      "Visa successes, university admits, and student placements supported by Lakshya International Edwise.",
    path: "/success-stories",
  });
}

export default function SuccessStoriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Success Stories"
        title="Real students. Real outcomes."
        description="Hear from students who achieved their study abroad goals with structured counselling and loan support."
      />
      <TestimonialsSection showHeading={false} />
      <CtaBanner />
    </>
  );
}

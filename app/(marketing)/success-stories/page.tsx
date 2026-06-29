import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/sections/page-hero";
import { TestimonialsSection } from "@/components/marketing/sections/testimonials";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return {
    title: `Success Stories | ${contact.companyName}`,
    description: "Visa successes, university admits, and student placements supported by our team.",
    alternates: { canonical: `${getSiteUrl()}/success-stories` },
  };
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

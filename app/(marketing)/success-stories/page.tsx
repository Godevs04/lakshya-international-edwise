import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/sections/section-heading";
import { TestimonialsSection } from "@/components/marketing/sections/testimonials";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return {
    title: `Success Stories | ${contact.companyName}`,
    description: "Visa successes, university admits, and student placements supported by Lakshya.",
    alternates: { canonical: `${getSiteUrl()}/success-stories` },
  };
}

export default function SuccessStoriesPage() {
  return (
    <>
      <section className="hero-gradient section-padding">
        <div className="container mx-auto max-w-4xl px-4">
          <SectionHeading
            eyebrow="Success Stories"
            title="Real students. Real outcomes."
            description="Hear from students who achieved their study abroad goals with structured counselling and loan support."
          />
        </div>
      </section>
      <TestimonialsSection />
      <CtaBanner />
    </>
  );
}

import Link from "next/link";
import { LeadForm } from "@/components/marketing/forms/lead-form";
import { SectionHeading } from "@/components/marketing/sections/section-heading";

export function MarketingHero() {
  return (
    <section className="hero-gradient section-padding">
      <div className="container mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Study Abroad Experts"
            title="Your trusted partner for global education and loans"
            description="Lakshya International Edwise guides students from counselling and admissions to visas, scholarships, and education loan disbursement."
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-marketing rounded-full px-6 py-3 text-sm font-semibold">
              Book Free Consultation
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-secondary hover:bg-muted"
            >
              Explore Services
            </Link>
          </div>
        </div>
        <LeadForm variant="consultation" formPage="/" />
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/sections/section-heading";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return {
    title: `About Us | ${contact.companyName}`,
    description: "Learn about Lakshya International Edwise mission, vision, and student-first approach.",
    alternates: { canonical: `${getSiteUrl()}/about` },
  };
}

const milestones = [
  { year: "2014", text: "Founded with a mission to simplify study abroad planning." },
  { year: "2018", text: "Expanded education loan partnerships with leading lenders." },
  { year: "2022", text: "Crossed 5,000 successful student placements globally." },
  { year: "2026", text: "Integrated digital CRM for faster counselling and admissions." },
];

export default function AboutPage() {
  return (
    <>
      <section className="hero-gradient section-padding">
        <div className="container mx-auto max-w-4xl px-4">
          <SectionHeading
            eyebrow="About"
            title="Guiding students with clarity, care, and global expertise"
            description="Lakshya International Edwise is a premium study abroad consultancy helping students choose the right destination, secure funding, and navigate visas with confidence."
          />
        </div>
      </section>

      <section className="section-padding">
        <div className="container mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-secondary">Our Mission</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              To make global education accessible through transparent counselling, ethical loan guidance, and end-to-end support.
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-secondary">Our Vision</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              To be India most trusted partner for students pursuing international degrees and careers.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted/20">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-6 text-2xl font-bold text-secondary">Our Journey</h2>
          <div className="space-y-4">
            {milestones.map((item) => (
              <div key={item.year} className="glass-card rounded-2xl p-4">
                <p className="text-sm font-semibold text-primary">{item.year}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

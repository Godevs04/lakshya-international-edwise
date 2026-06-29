import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/sections/page-hero";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { MARKETING_AWARDS } from "@/lib/constants/marketing/awards";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return {
    title: `About Us | ${contact.companyName}`,
    description: "Learn about our mission, vision, and student-first approach to study abroad counselling.",
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
  const contact = getMarketingContact();

  return (
    <>
      <PageHero
        eyebrow="About"
        title="Guiding students with clarity, care, and global expertise"
        description={`${contact.companyName} is a premium study abroad consultancy helping students choose the right destination, secure funding, and navigate visas with confidence.`}
      />

      <SectionShell variant="white" padding>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card-premium p-6">
            <h2 className="text-xl font-semibold text-secondary">Our Mission</h2>
            <p className="prose-marketing mt-3 text-sm text-muted-foreground">
              To make global education accessible through transparent counselling, ethical loan guidance, and end-to-end support.
            </p>
          </div>
          <div className="card-premium p-6">
            <h2 className="text-xl font-semibold text-secondary">Our Vision</h2>
            <p className="prose-marketing mt-3 text-sm text-muted-foreground">
              To be India&apos;s most trusted partner for students pursuing international degrees and careers.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell variant="muted" title="Our Journey" eyebrow="Timeline">
        <div className="mx-auto max-w-3xl space-y-4">
          {milestones.map((item) => (
            <div key={item.year} className="card-premium p-5">
              <p className="text-sm font-semibold text-primary">{item.year}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell variant="tint" title="Awards & recognitions" eyebrow="Trust" align="center">
        <div className="grid gap-4 md:grid-cols-3">
          {MARKETING_AWARDS.map((award) => (
            <div key={award.title} className="card-premium p-5 text-center">
              <p className="text-sm font-semibold text-secondary">{award.title}</p>
              {award.year && <p className="mt-1 text-xs text-primary">{award.year}</p>}
              {award.description && (
                <p className="mt-2 text-sm text-muted-foreground">{award.description}</p>
              )}
            </div>
          ))}
        </div>
      </SectionShell>

      <CtaBanner />
    </>
  );
}

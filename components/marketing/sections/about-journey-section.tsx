import { SectionShell } from "@/components/marketing/sections/section-shell";
import { ABOUT_MILESTONES } from "@/lib/constants/marketing/lakshya-value-props";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";

export function AboutJourneySection() {
  return (
    <SectionShell
      id="about"
      variant="white"
      eyebrow="About Lakshya"
      title="Your trusted overseas education financial partner"
      description="We are not an admissions consultancy. We exist to make funding your global education simple, fair, and fast — working alongside students and consultant partners alike."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {ABOUT_MILESTONES.map((milestone) => (
          <div key={milestone.title} className="card-premium p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {milestone.year}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">{milestone.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {milestone.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-accent/50 p-8 text-center">
        <p className="text-lg font-semibold text-foreground">
          20,000+ students funded · 20+ lending partners · ₹100+ Cr disbursed annually
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          Every application is compared across all our lenders so you get the lowest interest
          rate and the fastest possible approval — with zero service charges.
        </p>
        <div className="mt-6">
          <EligibilityCta source="about" className="px-7 py-3.5 text-base" />
        </div>
      </div>
    </SectionShell>
  );
}

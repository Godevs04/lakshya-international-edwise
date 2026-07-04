import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { AnimatedCounter } from "@/components/marketing/motion/counter";
import { Reveal, RevealItem, RevealStagger } from "@/components/marketing/motion/reveal";
import { ABOUT_MILESTONES } from "@/lib/constants/marketing/lakshya-value-props";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";

export function AboutPreviewSection() {
  return (
    <SectionShell
      variant="white"
      background="radial"
      journeyNode="about"
      eyebrow="About Lakshya"
      title="Your trusted overseas education financial partner"
      description="We make funding your global education simple, fair, and fast — comparing 20+ lenders so you get the lowest rate and fastest approval."
    >
      <RevealStagger className="grid gap-6 md:grid-cols-3">
        {ABOUT_MILESTONES.map((milestone) => (
          <RevealItem key={milestone.title}>
            <div className="card-premium h-full p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {milestone.year}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{milestone.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {milestone.description}
              </p>
            </div>
          </RevealItem>
        ))}
      </RevealStagger>

      <Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { value: 20000, suffix: "+", label: "Students funded" },
            { value: 20, suffix: "+", label: "Lending partners" },
            { value: 500, suffix: "+ Cr", label: "Disbursed" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border/60 bg-accent/30 p-5 text-center">
              <p className="text-2xl font-bold text-primary">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="mt-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center">
        <Link
          href="/about"
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white px-6 py-3 text-sm font-semibold text-primary transition-colors hover:border-primary/50 hover:bg-accent/40"
        >
          Our full story
          <ArrowRight className="h-4 w-4" />
        </Link>
        <EligibilityCta source="about-preview" className="px-6 py-3 text-sm" />
      </div>
    </SectionShell>
  );
}

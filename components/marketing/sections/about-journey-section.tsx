"use client";

import { SectionShell } from "@/components/marketing/sections/section-shell";
import { ABOUT_MILESTONES } from "@/lib/constants/marketing/lakshya-value-props";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { RevealStagger, RevealItem } from "@/components/marketing/motion/reveal";
import { Star } from "lucide-react";

export function AboutJourneySection() {
  return (
    <SectionShell
      variant="white"
      background="radial"
      eyebrow="Our Story"
      title="Built for students who deserve better financing"
      description="We are not an admissions consultancy. We exist to make funding your global education simple, fair, and fast — working alongside students and consultant partners alike."
    >
      <div className="relative mx-auto max-w-2xl">
        <div className="absolute bottom-0 left-4 top-0 w-px bg-primary/20" aria-hidden />
        <RevealStagger className="space-y-8">
          {ABOUT_MILESTONES.map((milestone) => (
            <RevealItem key={milestone.title}>
              <div className="relative pl-10">
                <span className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white text-xs font-bold text-primary">
                  {milestone.year.charAt(0)}
                </span>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {milestone.year}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">{milestone.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {milestone.description}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>

      <div className="mt-12 rounded-3xl border border-primary/10 bg-gradient-to-br from-accent/50 to-white p-8 text-center">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-medium text-primary shadow-sm">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          4.9 Google Rating · Trusted by 20K+ students
        </div>
        <p className="text-lg font-semibold text-foreground">
          Every application compared across all our lenders
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          Lowest interest rate and the fastest possible approval — with zero service charges.
        </p>
        <div className="mt-6">
          <EligibilityCta source="about" className="px-7 py-3.5 text-base" />
        </div>
      </div>
    </SectionShell>
  );
}

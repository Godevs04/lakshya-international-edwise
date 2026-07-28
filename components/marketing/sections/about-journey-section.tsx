"use client";

import { SectionShell } from "@/components/marketing/sections/section-shell";
import {
  ABOUT_CLOSING,
  ABOUT_INTRO_PARAGRAPHS,
  ABOUT_MISSION,
  ABOUT_VISION,
} from "@/lib/constants/marketing/about";
import { ABOUT_MILESTONES } from "@/lib/constants/marketing/lakshya-value-props";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { Reveal, RevealItem, RevealStagger } from "@/components/marketing/motion/reveal";
import { Compass, Eye, Star } from "lucide-react";

interface AboutJourneySectionProps {
  companyName: string;
}

export function AboutJourneySection({ companyName }: AboutJourneySectionProps) {
  return (
    <>
      <SectionShell
        variant="white"
        background="radial"
        eyebrow="Who We Are"
        title="Expert Education Loan Advisory for Studying Abroad"
        description={`${companyName} connects aspiring international students with leading banks and NBFCs.`}
      >
        <Reveal className="mx-auto max-w-3xl space-y-5 text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
          {ABOUT_INTRO_PARAGRAPHS.map((paragraph, index) => (
            <p key={paragraph.slice(0, 32)}>
              {index === 0 ? (
                <>
                  <span className="font-semibold text-foreground">{companyName}</span> {paragraph}
                </>
              ) : (
                paragraph
              )}
            </p>
          ))}
        </Reveal>

        <RevealStagger className="mt-12 grid gap-6 md:grid-cols-2">
          <RevealItem>
            <div className="card-premium h-full p-6 md:p-8">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Compass className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Our Mission</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                {ABOUT_MISSION}
              </p>
            </div>
          </RevealItem>
          <RevealItem>
            <div className="card-premium h-full p-6 md:p-8">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Eye className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Our Vision</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                {ABOUT_VISION}
              </p>
            </div>
          </RevealItem>
        </RevealStagger>

        <Reveal>
          <p className="mx-auto mt-10 max-w-3xl text-center text-base leading-relaxed text-muted-foreground">
            At <span className="font-semibold text-foreground">{companyName}</span>, {ABOUT_CLOSING}
          </p>
        </Reveal>
      </SectionShell>

      <SectionShell
        variant="muted"
        background="grid"
        eyebrow="Our Story"
        title="Built for Students Who Deserve Better Financing"
        description="Milestones from our journey helping students fund global education."
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
    </>
  );
}

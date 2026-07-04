"use client";

import { SectionShell } from "@/components/marketing/sections/section-shell";
import { ABOUT_MILESTONES } from "@/lib/constants/marketing/lakshya-value-props";
import { MARKETING_OFFICES } from "@/lib/constants/marketing/offices";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { AnimatedCounter } from "@/components/marketing/motion/counter";
import { RevealStagger, RevealItem } from "@/components/marketing/motion/reveal";
import { Star, MapPin } from "lucide-react";

export function AboutJourneySection() {
  return (
    <SectionShell
      id="about"
      variant="white"
      background="radial"
      eyebrow="About Lakshya"
      title="Your trusted overseas education financial partner"
      description="We are not an admissions consultancy. We exist to make funding your global education simple, fair, and fast — working alongside students and consultant partners alike."
    >
      <div className="relative mx-auto max-w-2xl">
        <div
          className="absolute bottom-0 left-4 top-0 w-px bg-primary/20"
          aria-hidden
        />
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

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          { value: 20000, suffix: "+", label: "Students funded" },
          { value: 20, suffix: "+", label: "Lending partners" },
          { value: 100, suffix: "+ Cr", label: "Disbursed annually" },
        ].map((stat) => (
          <div key={stat.label} className="card-premium p-5 text-center">
            <p className="text-2xl font-bold text-primary">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} pulseOnComplete />
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {MARKETING_OFFICES.map((office) => (
          <div
            key={office.name}
            className="rounded-2xl bg-gradient-to-br from-accent/60 to-primary/5 p-4 text-center"
          >
            <MapPin className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 text-sm font-semibold text-foreground">{office.name}</p>
            <p className="text-xs text-muted-foreground">{office.address}</p>
          </div>
        ))}
        {["Chennai HQ", "Hyderabad", "Bangalore"].map((city) => (
          <div
            key={city}
            className="rounded-2xl bg-gradient-to-br from-sky-50 to-accent/40 p-4 text-center"
          >
            <MapPin className="mx-auto h-5 w-5 text-primary/60" />
            <p className="mt-2 text-sm font-semibold text-foreground">{city}</p>
            <p className="text-xs text-muted-foreground">Office gallery coming soon</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-accent/50 p-8 text-center">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-medium text-primary">
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

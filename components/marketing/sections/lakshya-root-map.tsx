"use client";

import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import { Reveal, RevealStagger, RevealItem } from "@/components/marketing/motion/reveal";
import {
  WHY_LAKSHYA,
  WHAT_LAKSHYA_ACCEPTS,
  WHAT_LAKSHYA_GIVES_BACK,
} from "@/lib/constants/marketing/lakshya-value-props";

const BRANCHES = [
  {
    key: "why",
    title: "Why Lakshya",
    blurb: "The finance partner built around students.",
    items: WHY_LAKSHYA.slice(0, 4),
  },
  {
    key: "accepts",
    title: "What Lakshya Accepts",
    blurb: "Profiles others turn away, we take forward.",
    items: WHAT_LAKSHYA_ACCEPTS.slice(0, 4),
  },
  {
    key: "gives",
    title: "What Lakshya Gives Back",
    blurb: "Real savings and support, not just approvals.",
    items: WHAT_LAKSHYA_GIVES_BACK.slice(0, 4),
  },
];

export function LakshyaRootMap() {
  return (
    <SectionShell
      variant="muted"
      background="radial"
      eyebrow="Why Choose Us"
      title="One partner, three promises"
      description="From eligibility to disbursement, here is what sets Lakshya apart."
      align="center"
    >
      <div className="relative mx-auto max-w-4xl">
        <Reveal>
          <div className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/30 bg-white shadow-lg">
            <span className="text-lg font-bold text-primary">Lakshya</span>
          </div>
        </Reveal>

        <svg
          className="pointer-events-none absolute left-1/2 top-10 block h-[calc(100%-2.5rem)] w-full max-w-3xl -translate-x-1/2 opacity-60 sm:opacity-80 lg:opacity-100"
          viewBox="0 0 400 300"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M 200 40 L 80 120 M 200 40 L 320 120 M 200 40 L 200 200"
            stroke="rgba(11, 143, 216, 0.15)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>

        <RevealStagger className="relative grid gap-6 lg:grid-cols-3">
          {BRANCHES.map((branch) => (
            <RevealItem key={branch.key}>
              <div className="card-premium group p-6 transition-shadow hover:shadow-lg hover:ring-1 hover:ring-primary/15">
                <div className="mb-5 border-b border-border/60 pb-5 text-center">
                  <h3 className="text-xl font-bold text-primary">{branch.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{branch.blurb}</p>
                </div>
                <ul className="space-y-4">
                  {branch.items.map((item) => (
                    <li key={item.title} className="flex gap-3">
                      <span className="card-icon-tilt flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                        <MarketingIcon name={item.icon} className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-foreground">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </SectionShell>
  );
}

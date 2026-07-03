"use client";

import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { RevealStagger, RevealItem } from "@/components/marketing/motion/reveal";
import type { ValueProp } from "@/lib/constants/marketing/lakshya-value-props";
import { cn } from "@/lib/utils";

interface ValuePropsGridProps {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  items: ValueProp[];
  variant?: "white" | "muted" | "tint" | "accent";
  ctaSource: string;
}

const GRADIENTS = [
  "from-sky-50 to-blue-50/80",
  "from-cyan-50/80 to-sky-50",
  "from-blue-50/60 to-indigo-50/40",
  "from-teal-50/60 to-cyan-50/80",
  "from-violet-50/50 to-sky-50/80",
  "from-emerald-50/50 to-teal-50/60",
];

export function ValuePropsGrid({
  id,
  eyebrow,
  title,
  description,
  items,
  variant = "white",
  ctaSource,
}: ValuePropsGridProps) {
  return (
    <SectionShell
      id={id}
      variant={variant}
      background={variant === "accent" ? "routes" : "grid"}
      eyebrow={eyebrow}
      title={title}
      description={description}
    >
      <RevealStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <RevealItem key={item.title}>
            <div
              className={cn(
                "card-premium group flex gap-4 bg-gradient-to-br p-6 transition-all hover:scale-[1.02]",
                GRADIENTS[index % GRADIENTS.length]
              )}
            >
              <div className="card-icon-tilt flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/80 text-primary shadow-sm">
                <MarketingIcon name={item.icon} className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                {item.stat && (
                  <span className="mt-3 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    {item.stat}
                  </span>
                )}
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealStagger>
      <div className="mt-10 text-center">
        <EligibilityCta source={ctaSource} className="px-7 py-3.5 text-base" />
      </div>
    </SectionShell>
  );
}

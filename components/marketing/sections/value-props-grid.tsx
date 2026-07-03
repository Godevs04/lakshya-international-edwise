import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import type { ValueProp } from "@/lib/constants/marketing/lakshya-value-props";

interface ValuePropsGridProps {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  items: ValueProp[];
  variant?: "white" | "muted" | "tint" | "accent";
  ctaSource: string;
}

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
    <SectionShell id={id} variant={variant} eyebrow={eyebrow} title={title} description={description}>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="card-premium flex gap-4 p-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MarketingIcon name={item.icon} className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <EligibilityCta source={ctaSource} className="px-7 py-3.5 text-base" />
      </div>
    </SectionShell>
  );
}

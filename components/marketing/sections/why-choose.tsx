import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MARKETING_WHY_CHOOSE } from "@/lib/constants/marketing/why-choose";
import { MarketingIcon } from "@/lib/constants/marketing/icons";

export function WhyChooseSection() {
  return (
    <SectionShell
      variant="tint"
      eyebrow="Why Lakshya"
      title="Why students and parents choose us"
      description="A consultancy built on transparency, expertise, and outcomes - not sales pressure."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {MARKETING_WHY_CHOOSE.map((item) => (
          <div key={item.title} className="card-premium p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MarketingIcon name={item.icon} className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-secondary">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

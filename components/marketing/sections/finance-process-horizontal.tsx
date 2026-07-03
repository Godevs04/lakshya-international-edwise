import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import { HOW_IT_WORKS_STEPS } from "@/lib/constants/marketing/lakshya-value-props";

export function FinanceProcessHorizontal() {
  return (
    <SectionShell
      variant="accent"
      eyebrow="Your Dream, Our Lakshya"
      title="How it works — from eligibility to takeoff"
      description="A clear, fast path with milestones you can actually count on."
    >
      <ol className="relative grid gap-6 md:grid-cols-5">
        <div
          className="absolute left-0 right-0 top-8 hidden h-px bg-primary/25 md:block"
          aria-hidden
        />
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <li key={step.title} className="relative flex flex-col items-center text-center">
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-white text-primary shadow-sm">
              <MarketingIcon name={step.icon} className="h-7 w-7" />
              <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {index + 1}
              </span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
            <p className="mt-1 text-sm font-medium text-primary">{step.description}</p>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}

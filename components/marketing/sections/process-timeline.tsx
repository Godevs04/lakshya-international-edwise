import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MARKETING_PROCESS_STEPS } from "@/lib/constants/marketing/process";
import { MarketingIcon } from "@/lib/constants/marketing/icons";

export function ProcessTimelineSection() {
  return (
    <SectionShell
      variant="white"
      eyebrow="Your Journey"
      title="From dream to global career"
      description="A clear, step-by-step process that keeps you informed at every stage."
    >
      <div className="relative">
        <div className="absolute left-6 top-0 hidden h-full w-px bg-border md:left-1/2 md:block" aria-hidden />
        <div className="space-y-8">
          {MARKETING_PROCESS_STEPS.map((step, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={step.step}
                className={`relative flex flex-col gap-4 md:flex-row md:items-center ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className={`flex-1 ${isEven ? "md:text-right md:pr-12" : "md:pl-12"}`}>
                  <div className={`card-premium p-5 ${isEven ? "md:ml-auto md:max-w-md" : "md:max-w-md"}`}>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">
                      Step {step.step}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-secondary">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <div className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-white text-primary md:left-1/2 md:-translate-x-1/2">
                  <MarketingIcon name={step.icon} className="h-5 w-5" />
                </div>
                <div className="hidden flex-1 md:block" />
              </div>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}

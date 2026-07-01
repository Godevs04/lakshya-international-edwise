import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MARKETING_PROCESS_STEPS } from "@/lib/constants/marketing/process";
import { MarketingIcon } from "@/lib/constants/marketing/icons";

function StepIcon({ icon }: { icon: string }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-white text-primary shadow-sm md:h-12 md:w-12">
      <MarketingIcon name={icon} className="h-5 w-5" />
    </div>
  );
}

export function ProcessTimelineSection() {
  return (
    <SectionShell
      variant="white"
      eyebrow="Your Journey"
      title="From dream to global career"
      description="A clear, step-by-step process that keeps you informed at every stage."
    >
      <div className="relative">
        <div
          className="absolute left-5 top-0 hidden h-full w-px bg-border md:left-1/2 md:block"
          aria-hidden
        />
        <div className="space-y-5 md:space-y-8">
          {MARKETING_PROCESS_STEPS.map((step, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={step.step}
                className={`relative flex items-start gap-3 sm:gap-4 md:items-center ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Mobile / tablet: icon beside card */}
                <div className="pt-1 md:hidden">
                  <StepIcon icon={step.icon} />
                </div>

                <div
                  className={`min-w-0 flex-1 ${isEven ? "md:text-right md:pr-12" : "md:pl-12"}`}
                >
                  <div
                    className={`card-premium p-4 sm:p-5 ${
                      isEven ? "md:ml-auto md:max-w-md" : "md:max-w-md"
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">
                      Step {step.step}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-secondary sm:text-lg">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Desktop: centered timeline node */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
                  <StepIcon icon={step.icon} />
                </div>

                <div className="hidden flex-1 md:block" aria-hidden />
              </div>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}

import { MarketingIcon } from "@/lib/constants/marketing/icons";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import type { MarketingServiceSubOption } from "@/types/marketing";
import { cn } from "@/lib/utils";

interface EducationLoanOptionsSectionProps {
  options: MarketingServiceSubOption[];
}

export function EducationLoanOptionsSection({ options }: EducationLoanOptionsSectionProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {options.map((option) => (
        <article
          key={option.slug}
          id={option.slug}
          className={cn(
            "card-premium scroll-mt-28 p-6",
            "transition-transform hover:-translate-y-1"
          )}
        >
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MarketingIcon name={option.icon} className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{option.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {option.shortDescription}
          </p>
          <EligibilityCta
            source={`education-loan-${option.slug}`}
            className="mt-5 px-4 py-2 text-sm"
          />
        </article>
      ))}
    </div>
  );
}

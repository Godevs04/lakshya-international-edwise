import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import type { MarketingServiceSubOption } from "@/types/marketing";
import { cn } from "@/lib/utils";

interface EducationLoanOptionsSectionProps {
  options: MarketingServiceSubOption[];
}

export function EducationLoanOptionsSection({ options }: EducationLoanOptionsSectionProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((option) => (
        <Link
          key={option.slug}
          href={`#${option.slug}`}
          className={cn(
            "card-premium group flex items-start gap-3 p-4",
            "transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MarketingIcon name={option.icon} className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold leading-snug text-foreground">{option.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {option.shortDescription}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              Read more
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

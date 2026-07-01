import Link from "next/link";
import { cn } from "@/lib/utils";
import { MarketingContainer } from "@/components/marketing/layout/marketing-container";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function PageHero({
  eyebrow,
  title,
  description,
  className,
  primaryCta,
  secondaryCta,
}: PageHeroProps) {
  return (
    <section className={cn("hero-gradient section-padding pb-12 pt-16 md:pb-16 md:pt-20", className)}>
      <MarketingContainer>
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="heading-display text-secondary">{title}</h1>
          {description ? (
            <p className="prose-marketing mt-5 text-lg text-muted-foreground">{description}</p>
          ) : null}
          {(primaryCta || secondaryCta) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {primaryCta ? (
                <Link href={primaryCta.href} className="btn-marketing rounded-full px-6 py-3 text-sm font-semibold">
                  {primaryCta.label}
                </Link>
              ) : null}
              {secondaryCta ? (
                <Link
                  href={secondaryCta.href}
                  className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-secondary hover:bg-muted"
                >
                  {secondaryCta.label}
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </MarketingContainer>
    </section>
  );
}

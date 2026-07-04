import { cn } from "@/lib/utils";
import { MarketingContainer } from "@/components/marketing/layout/marketing-container";
import { SectionHeading } from "@/components/marketing/sections/section-heading";
import {
  PremiumSectionBg,
  type PremiumBackgroundVariant,
} from "@/components/marketing/backgrounds/premium-section-bg";
import { RevealStagger } from "@/components/marketing/motion/reveal";

type SectionVariant = "white" | "muted" | "tint" | "accent" | "dark" | "none";

interface SectionShellProps {
  id?: string;
  variant?: SectionVariant;
  padding?: boolean;
  eyebrow?: string;
  title?: string;
  description?: string;
  align?: "left" | "center";
  headingClassName?: string;
  className?: string;
  containerClassName?: string;
  background?: PremiumBackgroundVariant;
  withReveal?: boolean;
  journeyNode?: string;
  children: React.ReactNode;
}

const variantClasses: Record<SectionVariant, string> = {
  white: "section-white",
  muted: "section-muted",
  tint: "section-tint",
  accent: "section-accent",
  dark: "section-dark",
  none: "",
};

export function SectionShell({
  id,
  variant = "white",
  padding = true,
  eyebrow,
  title,
  description,
  align = "left",
  headingClassName,
  className,
  containerClassName,
  background = "none",
  withReveal = false,
  journeyNode,
  children,
}: SectionShellProps) {
  const hasHeading = Boolean(title);

  const content = (
    <>
      {hasHeading ? (
        <SectionHeading
          eyebrow={eyebrow}
          title={title!}
          description={description}
          align={align}
          inverted={variant === "dark"}
          className={cn("mb-10", headingClassName)}
        />
      ) : null}
      {withReveal ? <RevealStagger>{children}</RevealStagger> : children}
    </>
  );

  return (
    <section
      id={id}
      data-journey-node={journeyNode}
      className={cn(
        "section-relative",
        variantClasses[variant],
        padding && "section-padding",
        className
      )}
    >
      <PremiumSectionBg variant={background} />
      <MarketingContainer className={cn("relative z-[1]", containerClassName)}>
        {content}
      </MarketingContainer>
    </section>
  );
}

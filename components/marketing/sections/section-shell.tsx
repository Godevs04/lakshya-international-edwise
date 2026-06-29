import { cn } from "@/lib/utils";
import { MarketingContainer } from "@/components/marketing/layout/marketing-container";
import { SectionHeading } from "@/components/marketing/sections/section-heading";

type SectionVariant = "white" | "muted" | "tint" | "dark" | "none";

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
  children: React.ReactNode;
}

const variantClasses: Record<SectionVariant, string> = {
  white: "section-white",
  muted: "section-muted",
  tint: "section-tint",
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
  children,
}: SectionShellProps) {
  const hasHeading = Boolean(title);

  return (
    <section
      id={id}
      className={cn(
        variantClasses[variant],
        padding && "section-padding",
        className
      )}
    >
      <MarketingContainer className={containerClassName}>
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
        {children}
      </MarketingContainer>
    </section>
  );
}

import { cn } from "@/lib/utils";

interface MarketingContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
}

const sizeClasses = {
  default: "max-w-6xl",
  wide: "max-w-7xl",
  narrow: "max-w-4xl",
};

export function MarketingContainer({
  children,
  className,
  size = "default",
}: MarketingContainerProps) {
  return (
    <div className={cn("container mx-auto px-4", sizeClasses[size], className)}>
      {children}
    </div>
  );
}

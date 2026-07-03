import Image from "next/image";
import type { MarketingLender } from "@/types/marketing";
import { cn } from "@/lib/utils";

interface LenderLogoProps {
  lender: MarketingLender;
  className?: string;
}

/**
 * Renders a lender logo image when available, otherwise a styled text wordmark
 * so lenders without artwork still look intentional in carousels and cards.
 */
export function LenderLogo({ lender, className }: LenderLogoProps) {
  if (lender.logo) {
    return (
      <Image
        src={lender.logo}
        alt={`${lender.name} education loan partner logo`}
        width={lender.logoWidth ?? 220}
        height={lender.logoHeight ?? 60}
        className={cn("h-10 w-auto max-w-[150px] object-contain", className)}
        sizes="160px"
      />
    );
  }

  return (
    <span
      className={cn(
        "text-lg font-extrabold tracking-tight whitespace-nowrap",
        className
      )}
      style={{ color: lender.accent ?? "#0f172a" }}
    >
      {lender.name}
    </span>
  );
}

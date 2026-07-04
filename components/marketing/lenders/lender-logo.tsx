import Image from "next/image";
import type { MarketingLender } from "@/types/marketing";
import { cn } from "@/lib/utils";

type LenderLogoSize = "sm" | "md" | "lg";

interface LenderLogoProps {
  lender: MarketingLender;
  size?: LenderLogoSize;
  className?: string;
}

const SIZE_SCALE: Record<LenderLogoSize, number> = {
  sm: 0.78,
  md: 1,
  lg: 1.12,
};

/**
 * Renders a lender logo image when available, otherwise a styled text wordmark.
 * Display dimensions are tuned per lender so wide, square, and compact marks
 * sit at a similar visual weight across carousels and cards.
 */
export function LenderLogo({ lender, size = "md", className }: LenderLogoProps) {
  const scale = SIZE_SCALE[size];
  const displayHeight = Math.round((lender.logoDisplayHeight ?? 40) * scale);
  const maxWidth = Math.round((lender.logoMaxWidth ?? 150) * scale);

  if (lender.logo) {
    return (
      <Image
        src={lender.logo}
        alt={`${lender.name} education loan partner logo`}
        width={lender.logoWidth ?? 220}
        height={lender.logoHeight ?? 60}
        quality={85}
        className={cn("w-auto shrink-0 object-contain object-center", className)}
        style={{ height: displayHeight, maxWidth }}
        sizes={`${Math.round(maxWidth * 2)}px`}
      />
    );
  }

  return (
    <span
      className={cn(
        "text-lg font-extrabold tracking-tight whitespace-nowrap",
        className
      )}
      style={{ color: lender.accent ?? "#0f172a", fontSize: displayHeight * 0.55 }}
    >
      {lender.name}
    </span>
  );
}

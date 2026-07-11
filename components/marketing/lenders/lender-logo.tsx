import Image from "next/image";
import type { MarketingLender } from "@/types/marketing";
import { cn } from "@/lib/utils";

type LenderLogoSize = "sm" | "md" | "lg" | "carousel" | "dashboard";

interface LenderLogoProps {
  lender: MarketingLender;
  size?: LenderLogoSize;
  className?: string;
  /** Dashboard tiles — sizing handled by CSS, not inline styles */
  fitTile?: boolean;
}

const SIZE_SCALE: Record<LenderLogoSize, number> = {
  sm: 0.78,
  md: 1,
  lg: 1.12,
  carousel: 1.28,
  dashboard: 0.52,
};

/** Default marketing size — matches the homepage lender carousel. */
export const LENDER_LOGO_MARKETING_SIZE: LenderLogoSize = "carousel";

/** Shared logo tile shell for carousel, preview grids, and partner cards. */
export const LENDER_LOGO_TILE_CLASS =
  "flex h-20 w-full min-w-0 items-center justify-center overflow-hidden rounded-xl bg-white px-3 shadow-sm ring-1 ring-black/[0.03]";

/**
 * Renders a lender logo image when available, otherwise a styled text wordmark.
 * Display dimensions are tuned per lender so wide, square, and compact marks
 * sit at a similar visual weight across carousels and cards.
 */
export function LenderLogo({
  lender,
  size = "md",
  className,
  fitTile = false,
}: LenderLogoProps) {
  const scale = SIZE_SCALE[size];
  const useTileFit = fitTile && size === "dashboard";
  const displayHeight = Math.round((lender.logoDisplayHeight ?? 40) * scale);
  const maxWidth = Math.round((lender.logoMaxWidth ?? 150) * scale);

  if (lender.logo) {
    return (
      <div className="flex h-full w-full min-w-0 items-center justify-center overflow-hidden">
        <Image
          src={lender.logo}
          alt={`${lender.name} education loan partner logo`}
          width={lender.logoWidth ?? 220}
          height={lender.logoHeight ?? 60}
          quality={90}
          className={cn(
            "h-auto w-auto max-h-full max-w-full object-contain object-center",
            useTileFit && "services-bento-dashboard-logo-img",
            className
          )}
          style={useTileFit ? undefined : { maxHeight: displayHeight, maxWidth }}
          sizes={useTileFit ? "80px" : `${Math.round(maxWidth * 2)}px`}
        />
      </div>
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

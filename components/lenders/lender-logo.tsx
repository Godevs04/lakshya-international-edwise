import { Building2 } from "lucide-react";
import { getLenderBrand } from "@/lib/constants/lenders";
import { cn } from "@/lib/utils";

type LenderLogoSize = "sm" | "md" | "lg" | "xl";

interface LenderLogoProps {
  slug?: string;
  name?: string;
  logo?: string;
  accent?: string;
  size?: LenderLogoSize;
  className?: string;
}

const SIZE_STYLES: Record<LenderLogoSize, { shell: string; image: string }> = {
  sm: {
    shell: "h-14 min-w-[7.5rem] max-w-[9.5rem] px-3 py-2",
    image: "h-9 w-full",
  },
  md: {
    shell: "h-16 min-w-[8.5rem] max-w-[10.5rem] px-3 py-2.5",
    image: "h-10 w-full",
  },
  lg: {
    shell: "h-[4.75rem] min-w-[10.5rem] max-w-[13rem] px-4 py-3",
    image: "h-11 w-full",
  },
  xl: {
    shell: "h-24 min-w-[12.5rem] max-w-[16rem] px-5 py-3.5",
    image: "h-14 w-full",
  },
};

const ICON_SHELL: Record<LenderLogoSize, string> = {
  sm: "h-14 w-14",
  md: "h-16 w-16",
  lg: "h-[4.75rem] w-[4.75rem]",
  xl: "h-24 w-24",
};

const ICON_GLYPH: Record<LenderLogoSize, string> = {
  sm: "h-6 w-6",
  md: "h-7 w-7",
  lg: "h-8 w-8",
  xl: "h-10 w-10",
};

export function LenderLogo({
  slug,
  name,
  logo,
  accent,
  size = "md",
  className,
}: LenderLogoProps) {
  const seedBrand = getLenderBrand(slug, name);
  const brand = logo
    ? {
        name: name ?? seedBrand?.name ?? slug ?? "Bank",
        logo,
        accent: accent ?? seedBrand?.accent ?? "#6D5EF7",
      }
    : seedBrand;
  const sizeStyle = SIZE_STYLES[size];

  if (brand?.logo) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white shadow-md",
          sizeStyle.shell,
          className
        )}
        style={{ borderLeftWidth: 4, borderLeftColor: brand.accent }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brand.logo}
          alt={`${brand.name} logo`}
          className={cn("object-contain object-center", sizeStyle.image)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#6D5EF7] shadow-md",
        ICON_SHELL[size],
        className
      )}
    >
      <Building2 className={cn("text-white", ICON_GLYPH[size])} />
    </div>
  );
}

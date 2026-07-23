import Image from "next/image";
import { APP_LOGO_ASPECT_RATIO, DEFAULT_APP_LOGO } from "@/lib/brand/app-logo";
import { cn } from "@/lib/utils";

export type AppLogoVariant = "auth" | "sidebar" | "mobile" | "settings";
export type AppLogoSurface = "light" | "dark";

const VARIANTS: Record<
  AppLogoVariant,
  { height: number; maxWidth: number; className: string }
> = {
  auth: {
    height: 112,
    maxWidth: 112,
    className: "h-28 max-w-[7rem]",
  },
  sidebar: {
    height: 48,
    maxWidth: 48,
    className: "h-12 w-12",
  },
  mobile: {
    height: 44,
    maxWidth: 44,
    className: "h-11 max-w-[2.75rem]",
  },
  settings: {
    height: 96,
    maxWidth: 96,
    className: "h-24 max-w-[6rem]",
  },
};

interface AppLogoProps {
  src?: string;
  alt: string;
  variant?: AppLogoVariant;
  surface?: AppLogoSurface;
  className?: string;
  priority?: boolean;
}

function isLocalStaticAsset(src: string) {
  return src.startsWith("/") && !src.startsWith("//");
}

export function AppLogo({
  src,
  alt,
  variant = "auth",
  surface = "light",
  className,
  priority,
}: AppLogoProps) {
  const styles = VARIANTS[variant];
  const logoSrc = src?.trim() || DEFAULT_APP_LOGO;
  const width = Math.round(styles.height * APP_LOGO_ASPECT_RATIO);
  const onDark = surface === "dark";

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden",
        onDark
          ? "rounded-full bg-white/10 p-0.5 ring-1 ring-white/20 backdrop-blur-sm"
          : "rounded-2xl bg-white px-2 py-1.5 shadow-lg shadow-[#E8952E]/15 ring-1 ring-black/5",
        variant === "sidebar" && onDark && "aspect-square",
        variant !== "sidebar" && "overflow-hidden",
        styles.className,
        className
      )}
      style={variant === "sidebar" ? undefined : { aspectRatio: APP_LOGO_ASPECT_RATIO }}
    >
      <Image
        src={logoSrc}
        alt={alt}
        width={width}
        height={styles.height}
        quality={100}
        unoptimized={isLocalStaticAsset(logoSrc)}
        priority={priority ?? variant === "auth"}
        className={cn(
          "h-full w-full object-contain object-center",
          variant === "sidebar" && onDark && "rounded-full"
        )}
        sizes={`(max-width: 768px) ${Math.min(width, styles.maxWidth)}px, ${styles.maxWidth}px`}
      />
    </div>
  );
}

import Image from "next/image";
import { APP_LOGO_ASPECT_RATIO, DEFAULT_APP_LOGO } from "@/lib/brand/app-logo";
import { cn } from "@/lib/utils";

export type AppLogoVariant = "auth" | "sidebar" | "mobile" | "settings";

const VARIANTS: Record<
  AppLogoVariant,
  { height: number; maxWidth: number; className: string }
> = {
  auth: {
    height: 120,
    maxWidth: 220,
    className: "h-[7.5rem] max-w-[13.75rem]",
  },
  sidebar: {
    height: 56,
    maxWidth: 104,
    className: "h-14 max-w-[6.5rem]",
  },
  mobile: {
    height: 48,
    maxWidth: 88,
    className: "h-12 max-w-[5.5rem]",
  },
  settings: {
    height: 96,
    maxWidth: 176,
    className: "h-24 max-w-[11rem]",
  },
};

interface AppLogoProps {
  src?: string;
  alt: string;
  variant?: AppLogoVariant;
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
  className,
  priority,
}: AppLogoProps) {
  const styles = VARIANTS[variant];
  const logoSrc = src?.trim() || DEFAULT_APP_LOGO;
  const width = Math.round(styles.height * APP_LOGO_ASPECT_RATIO);

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white px-2 py-1.5 shadow-lg shadow-[#6D5EF7]/15 ring-1 ring-black/5",
        styles.className,
        className
      )}
      style={{ aspectRatio: APP_LOGO_ASPECT_RATIO }}
    >
      <Image
        src={logoSrc}
        alt={alt}
        width={width}
        height={styles.height}
        quality={100}
        unoptimized={isLocalStaticAsset(logoSrc)}
        priority={priority ?? variant === "auth"}
        className="h-full w-full object-contain object-center"
        sizes={`(max-width: 768px) ${Math.min(width, styles.maxWidth)}px, ${styles.maxWidth}px`}
      />
    </div>
  );
}

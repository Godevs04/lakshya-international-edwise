import Image from "next/image";
import { APP_LOGO_ASPECT_RATIO, DEFAULT_APP_LOGO } from "@/lib/brand/app-logo";
import { cn } from "@/lib/utils";

export type AppLogoVariant = "auth" | "sidebar" | "mobile" | "settings" | "navbar" | "footer";
export type AppLogoSurface = "light" | "dark";

const VARIANTS: Record<
  AppLogoVariant,
  { height: number; maxWidth: number; className: string; framedDefault: boolean }
> = {
  auth: {
    height: 112,
    maxWidth: 112,
    className: "h-28 max-w-[7rem]",
    framedDefault: true,
  },
  sidebar: {
    height: 48,
    maxWidth: 48,
    className: "h-12 w-12",
    framedDefault: false,
  },
  mobile: {
    height: 44,
    maxWidth: 44,
    className: "h-11 w-11",
    framedDefault: false,
  },
  navbar: {
    height: 48,
    maxWidth: 48,
    className: "h-12 w-12",
    framedDefault: false,
  },
  footer: {
    height: 56,
    maxWidth: 56,
    className: "h-14 w-14",
    framedDefault: false,
  },
  settings: {
    height: 96,
    maxWidth: 96,
    className: "h-24 max-w-[6rem]",
    framedDefault: true,
  },
};

interface AppLogoProps {
  src?: string;
  alt: string;
  variant?: AppLogoVariant;
  surface?: AppLogoSurface;
  /** White padded frame — use for auth/settings only; navbar stays chrome-free like Epicred/Nomad. */
  framed?: boolean;
  /**
   * When the logo sits next to visible brand text (navbar lockup), pass empty alt
   * so screen readers do not hear the company name twice.
   */
  decorative?: boolean;
  className?: string;
  priority?: boolean;
}

export function AppLogo({
  src,
  alt,
  variant = "auth",
  surface = "light",
  framed,
  decorative = false,
  className,
  priority,
}: AppLogoProps) {
  const styles = VARIANTS[variant];
  const logoSrc = src?.trim() || DEFAULT_APP_LOGO;
  // 2× display pixels for retina; Next Image serves a resized WebP/AVIF.
  const width = Math.round(styles.height * APP_LOGO_ASPECT_RATIO * 2);
  const height = styles.height * 2;
  const onDark = surface === "dark";
  const showFrame = framed ?? styles.framedDefault;

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        showFrame &&
          (onDark
            ? "overflow-hidden rounded-2xl bg-white/10 p-1.5 ring-1 ring-white/20 backdrop-blur-sm"
            : "overflow-hidden rounded-2xl bg-white px-2 py-1.5 shadow-md shadow-slate-900/8 ring-1 ring-slate-900/5"),
        !showFrame && onDark && "rounded-xl bg-white p-1",
        styles.className,
        className
      )}
      style={
        showFrame || variant === "sidebar" ? undefined : { aspectRatio: APP_LOGO_ASPECT_RATIO }
      }
    >
      <Image
        src={logoSrc}
        alt={decorative ? "" : alt}
        width={width}
        height={height}
        quality={85}
        priority={priority ?? (variant === "auth" || variant === "navbar")}
        className="h-full w-full object-contain object-center"
        sizes={`${styles.maxWidth * 2}px`}
      />
    </div>
  );
}

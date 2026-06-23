import Image from "next/image";
import { DEFAULT_APP_LOGO } from "@/lib/brand/app-logo";
import { cn } from "@/lib/utils";

export type AppLogoVariant = "auth" | "sidebar" | "mobile";

const VARIANTS: Record<
  AppLogoVariant,
  { container: string; width: number; height: number; padding: string }
> = {
  auth: {
    container: "h-28 w-28",
    width: 112,
    height: 112,
    padding: "p-1.5",
  },
  sidebar: {
    container: "h-12 w-12",
    width: 48,
    height: 48,
    padding: "p-1",
  },
  mobile: {
    container: "h-10 w-10",
    width: 40,
    height: 40,
    padding: "p-0.5",
  },
};

interface AppLogoProps {
  src?: string;
  alt: string;
  variant?: AppLogoVariant;
  className?: string;
  priority?: boolean;
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

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-2xl bg-white shadow-lg shadow-[#6D5EF7]/15 ring-2 ring-white/60",
        styles.container,
        className
      )}
    >
      <Image
        src={logoSrc}
        alt={alt}
        width={styles.width}
        height={styles.height}
        priority={priority ?? variant === "auth"}
        className={cn("h-full w-full object-contain object-center", styles.padding)}
      />
    </div>
  );
}

import type { Metadata } from "next";
import { PremiumBackground } from "@/components/layout/premium-background";
import { Design06TopWaves } from "@/components/layout/design06-top-waves";
import { AppLogo } from "@/components/brand/app-logo";
import { APP_TAGLINE } from "@/lib/brand/app-logo";
import { getAppConfig } from "@/lib/config/app-config";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <PremiumBackground />
      <Design06TopWaves />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(11,143,216,0.16),transparent)]"
        aria-hidden
      />
      <AuthLayoutInner>{children}</AuthLayoutInner>
    </div>
  );
}

async function AuthLayoutInner({ children }: { children: React.ReactNode }) {
  const config = await getAppConfig();
  return (
    <div className="relative z-10 w-full max-w-md animate-fade-in-up px-4 sm:max-w-lg sm:px-0">
      <div className="mb-8 text-center">
        <AppLogo
          src={config.company.logo}
          alt={config.company.name}
          variant="auth"
          className="mx-auto mb-4 shadow-xl shadow-primary/15 ring-1 ring-primary/10"
          priority
        />
        <h1 className="gradient-text text-2xl font-bold tracking-tight sm:text-3xl">
          {config.company.name}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{APP_TAGLINE}</p>
        <div
          className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          aria-hidden
        />
      </div>
      {children}
    </div>
  );
}

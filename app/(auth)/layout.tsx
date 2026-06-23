import { PremiumBackground } from "@/components/layout/premium-background";
import { AppLogo } from "@/components/brand/app-logo";
import { APP_TAGLINE } from "@/lib/brand/app-logo";
import { getAppConfig } from "@/lib/config/app-config";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <PremiumBackground />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#6D5EF7]/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#06B6D4]/15 blur-[100px]" />
      </div>
      <AuthLayoutInner>{children}</AuthLayoutInner>
    </div>
  );
}

async function AuthLayoutInner({ children }: { children: React.ReactNode }) {
  const config = await getAppConfig();
  return (
    <div className="relative z-10 w-full max-w-md px-4 sm:max-w-lg sm:px-0">
      <div className="mb-8 text-center">
        <AppLogo
          src={config.company.logo}
          alt={config.company.name}
          variant="auth"
          className="mx-auto mb-4 shadow-xl shadow-[#6D5EF7]/20"
          priority
        />
        <h1 className="text-2xl font-bold tracking-tight">{config.company.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{APP_TAGLINE}</p>
      </div>
      {children}
    </div>
  );
}

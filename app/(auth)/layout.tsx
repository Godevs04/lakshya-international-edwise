import { PremiumBackground } from "@/components/layout/premium-background";
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
    <div className="relative z-10 w-full max-w-md">
      <div className="mb-8 text-center">
        {config.company.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.company.logo}
            alt={config.company.name}
            className="mx-auto mb-4 h-14 w-14 rounded-2xl object-cover ring-4 ring-white/50 shadow-xl shadow-[#6D5EF7]/20"
          />
        ) : (
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D5EF7] to-[#8B5CF6] text-xl font-bold text-white shadow-xl shadow-[#6D5EF7]/30">
            {config.company.name.charAt(0)}
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{config.company.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Premium Education Consultancy CRM</p>
      </div>
      {children}
    </div>
  );
}

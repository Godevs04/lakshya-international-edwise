import { getAppConfig } from "@/lib/config/app-config";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
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
            className="mx-auto mb-4 h-12 w-12 rounded-xl object-cover"
          />
        ) : (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            {config.company.name.charAt(0)}
          </div>
        )}
        <h1 className="text-xl font-semibold">{config.company.name}</h1>
      </div>
      {children}
    </div>
  );
}

import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { APP_TAGLINE } from "@/lib/brand/app-logo";
import { getAppConfig } from "@/lib/config/app-config";
import { fontMono, fontSans } from "@/lib/fonts";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getAppConfig();
  return {
    title: {
      default: config.company.name,
      template: `%s | ${config.company.name}`,
    },
    description: `${config.company.name} — ${APP_TAGLINE}`,
    applicationName: config.company.name,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: config.company.name,
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#6D5EF7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`light ${fontSans.variable} ${fontMono.variable} ${fontSans.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <PwaRegister />
      </body>
    </html>
  );
}

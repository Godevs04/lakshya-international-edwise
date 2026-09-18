import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { APP_TAGLINE } from "@/lib/brand/app-logo";
import { getAppConfig } from "@/lib/config/app-config";
import { getSiteUrl } from "@/lib/config/marketing";
import { fontMarketing, fontMono, fontSans } from "@/lib/fonts";
import { THEME_INIT_SCRIPT } from "@/lib/theme-init-script";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getAppConfig();
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: config.company.name,
      template: `%s | ${config.company.name}`,
    },
    description: `${config.company.name} — ${APP_TAGLINE}`,
    applicationName: config.company.name,
    icons: {
      icon: [
        { url: "/favicon-32.png?v=8", sizes: "32x32", type: "image/png" },
        { url: "/favicon-48.png?v=8", sizes: "48x48", type: "image/png" },
        { url: "/favicon.ico?v=8", sizes: "any" },
        { url: "/icon-192.png?v=8", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png?v=8", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png?v=8", sizes: "180x180", type: "image/png" }],
    },
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
  themeColor: "#0B8FD8",
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
      className={`light ${fontMarketing.variable} ${fontSans.variable} ${fontMono.variable} ${fontMarketing.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script id="lakshya-theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <Providers>{children}</Providers>
        <PwaRegister />
      </body>
    </html>
  );
}

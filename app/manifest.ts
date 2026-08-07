import type { MetadataRoute } from "next";
import { APP_TAGLINE } from "@/lib/brand/app-logo";
import { getDefaultCompanySettings } from "@/lib/config/app-defaults";

export default function manifest(): MetadataRoute.Manifest {
  const company = getDefaultCompanySettings();

  return {
    id: "/",
    name: company.name,
    short_name: "Lakshya",
    description: `${company.name} — ${APP_TAGLINE}. Overseas education loan experts for Indian students.`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#0B8FD8",
    categories: ["finance", "education", "business"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/Lakshya-App-logo-256.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

import type { MetadataRoute } from "next";
import { APP_TAGLINE } from "@/lib/brand/app-logo";
import { getDefaultCompanySettings } from "@/lib/config/app-defaults";

export default function manifest(): MetadataRoute.Manifest {
  const company = getDefaultCompanySettings();
  const shortName =
    company.name.length > 12 ? company.name.slice(0, 12).trim() : company.name;
  const logoUrl = company.logo?.trim();

  const icons: MetadataRoute.Manifest["icons"] = [
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
      src: "/icon",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ];

  if (logoUrl) {
    icons.unshift({
      src: logoUrl,
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    });
  }

  return {
    id: "/",
    name: company.name,
    short_name: shortName,
    description: `${company.name} — ${APP_TAGLINE}`,
    start_url: "/dashboard/overview",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#E8952E",
    categories: ["business", "productivity"],
    icons,
  };
}

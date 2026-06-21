import type { MetadataRoute } from "next";
import { getDefaultCompanySettings } from "@/lib/config/app-defaults";

export default function manifest(): MetadataRoute.Manifest {
  const company = getDefaultCompanySettings();
  const shortName =
    company.name.length > 12 ? company.name.slice(0, 12).trim() : company.name;

  return {
    id: "/",
    name: company.name,
    short_name: shortName,
    description: `${company.name} — Education Consultancy CRM`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#6D5EF7",
    categories: ["business", "productivity"],
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
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

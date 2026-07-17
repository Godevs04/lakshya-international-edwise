import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config/marketing";
import { MARKETING_SERVICES } from "@/lib/constants/marketing/services";
import { MARKETING_COUNTRIES } from "@/lib/constants/marketing/countries";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  const staticRoutes: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/services", priority: 0.9, changeFrequency: "weekly" },
    { path: "/services/education-loan", priority: 0.95, changeFrequency: "weekly" },
    { path: "/lending-partners", priority: 0.9, changeFrequency: "weekly" },
    { path: "/countries", priority: 0.9, changeFrequency: "weekly" },
    { path: "/countries/dubai", priority: 0.9, changeFrequency: "weekly" },
    { path: "/countries/ireland", priority: 0.9, changeFrequency: "weekly" },
    { path: "/countries/canada", priority: 0.9, changeFrequency: "weekly" },
    { path: "/become-a-partner", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.85, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
    { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms-of-service", priority: 0.3, changeFrequency: "yearly" },
  ];

  const highlighted = new Set(staticRoutes.map((route) => route.path));

  return [
    ...staticRoutes.map(({ path, priority, changeFrequency }) => ({
      url: `${base}${path}`,
      changeFrequency,
      priority,
    })),
    ...MARKETING_SERVICES.filter((service) => !highlighted.has(`/services/${service.slug}`)).map(
      (service) => ({
        url: `${base}/services/${service.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })
    ),
    ...MARKETING_COUNTRIES.filter((country) => !highlighted.has(`/countries/${country.slug}`)).map(
      (country) => ({
        url: `${base}/countries/${country.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })
    ),
  ];
}

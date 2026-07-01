import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config/marketing";
import { MARKETING_SERVICES } from "@/lib/constants/marketing/services";
import { MARKETING_COUNTRIES } from "@/lib/constants/marketing/countries";
import { getAllBlogPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/services", priority: 0.9, changeFrequency: "weekly" },
    { path: "/countries", priority: 0.9, changeFrequency: "weekly" },
    { path: "/education-loans", priority: 0.9, changeFrequency: "weekly" },
    { path: "/success-stories", priority: 0.7, changeFrequency: "monthly" },
    { path: "/gallery", priority: 0.6, changeFrequency: "monthly" },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
    { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms-of-service", priority: 0.3, changeFrequency: "yearly" },
  ];

  return [
    ...staticRoutes.map(({ path, priority, changeFrequency }) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...MARKETING_SERVICES.map((service) => ({
      url: `${base}/services/${service.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...MARKETING_COUNTRIES.map((country) => ({
      url: `${base}/countries/${country.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...getAllBlogPosts().map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

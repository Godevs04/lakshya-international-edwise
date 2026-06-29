import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config/marketing";
import { MARKETING_SERVICES } from "@/lib/constants/marketing/services";
import { MARKETING_COUNTRIES } from "@/lib/constants/marketing/countries";
import { getAllBlogPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/countries",
    "/education-loans",
    "/success-stories",
    "/gallery",
    "/blog",
    "/contact",
    "/privacy-policy",
    "/terms-of-service",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
    })),
    ...MARKETING_SERVICES.map((service) => ({
      url: `${base}/services/${service.slug}`,
      lastModified: new Date(),
    })),
    ...MARKETING_COUNTRIES.map((country) => ({
      url: `${base}/countries/${country.slug}`,
      lastModified: new Date(),
    })),
    ...getAllBlogPosts().map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.date),
    })),
  ];
}

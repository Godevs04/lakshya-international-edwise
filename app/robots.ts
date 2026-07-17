import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config/marketing";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/api/",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/verify-otp",
        "/pending-approval",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

import type { MarketingNavItem } from "@/types/marketing";
import { MARKETING_SERVICES } from "@/lib/constants/marketing/services";
import { MARKETING_COUNTRIES } from "@/lib/constants/marketing/countries";

export const MARKETING_RESOURCES: MarketingNavItem[] = [
  { label: "Blog", href: "/blog" },
  { label: "Success Stories", href: "/success-stories" },
  { label: "Gallery", href: "/gallery" },
];

export const MARKETING_NAV: MarketingNavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Services",
    href: "/services",
    megaMenu: "services",
    children: MARKETING_SERVICES.map((service) => ({
      label: service.title,
      href: `/services/${service.slug}`,
    })),
  },
  {
    label: "Countries",
    href: "/countries",
    megaMenu: "countries",
    children: MARKETING_COUNTRIES.map((country) => ({
      label: country.name,
      href: `/countries/${country.slug}`,
    })),
  },
  { label: "Education Loans", href: "/education-loans" },
  {
    label: "Resources",
    href: "/blog",
    megaMenu: "resources",
    children: MARKETING_RESOURCES,
  },
  { label: "Contact", href: "/contact" },
];

export const MARKETING_FOOTER_LINKS = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Success Stories", href: "/success-stories" },
    { label: "Gallery", href: "/gallery" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  resources: MARKETING_RESOURCES,
  services: MARKETING_SERVICES.map((service) => ({
    label: service.title,
    href: `/services/${service.slug}`,
  })),
  countries: MARKETING_COUNTRIES.map((country) => ({
    label: country.name,
    href: `/countries/${country.slug}`,
  })),
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
  ],
};

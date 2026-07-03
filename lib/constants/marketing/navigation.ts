import type { MarketingNavItem } from "@/types/marketing";
import { MARKETING_SERVICES } from "@/lib/constants/marketing/services";
import { MARKETING_COUNTRIES } from "@/lib/constants/marketing/countries";

export const MARKETING_NAV: MarketingNavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Our Services",
    href: "/services",
    megaMenu: "services",
    children: MARKETING_SERVICES.map((service) => ({
      label: service.title,
      href: `/services/${service.slug}`,
    })),
  },
  { label: "Lending Partners", href: "/lending-partners" },
  {
    label: "Countries",
    href: "/countries",
    megaMenu: "countries",
    children: MARKETING_COUNTRIES.map((country) => ({
      label: country.name,
      href: `/countries/${country.slug}`,
    })),
  },
  { label: "About Us", href: "/#about" },
  { label: "Become a Partner", href: "/become-a-partner" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const MARKETING_FOOTER_LINKS = {
  company: [
    { label: "About Us", href: "/#about" },
    { label: "Lending Partners", href: "/lending-partners" },
    { label: "Become a Partner", href: "/become-a-partner" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
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

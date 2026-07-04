import type { MarketingNavItem } from "@/types/marketing";
import { MARKETING_SERVICES } from "@/lib/constants/marketing/services";
import { MARKETING_COUNTRIES } from "@/lib/constants/marketing/countries";
import {
  EDUCATION_LOAN_OPTIONS,
  getEducationLoanOptionHref,
} from "@/lib/constants/marketing/education-loan-options";

function buildServiceNavChildren(): MarketingNavItem[] {
  return MARKETING_SERVICES.flatMap((service) => {
    const items: MarketingNavItem[] = [
      { label: service.title, href: `/services/${service.slug}` },
    ];
    if (service.slug === "education-loan") {
      items.push(
        ...EDUCATION_LOAN_OPTIONS.map((option) => ({
          label: option.title,
          href: getEducationLoanOptionHref(option.slug),
        }))
      );
    }
    return items;
  });
}

export const MARKETING_NAV: MarketingNavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Our Services",
    href: "/services",
    megaMenu: "services",
    children: buildServiceNavChildren(),
  },
  {
    label: "Lending Partners",
    shortLabel: "Lenders",
    href: "/lending-partners",
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
  { label: "About Us", href: "/#about" },
  {
    label: "Become a Partner",
    shortLabel: "Partner",
    href: "/become-a-partner",
    featured: true,
  },
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

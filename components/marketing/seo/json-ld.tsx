interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd(params: {
  name: string;
  url: string;
  email?: string;
  phone?: string;
  logo?: string;
  sameAs?: string[];
  address?: string;
}) {
  const organizationId = `${params.url.replace(/\/$/, "")}/#organization`;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: params.name,
    alternateName: ["Lakshya Edwise", "Lakshya International Edwise Education Loans"],
    url: params.url,
    email: params.email,
    telephone: params.phone,
    ...(params.logo ? { logo: params.logo, image: params.logo } : {}),
    ...(params.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: params.address,
            addressCountry: "IN",
          },
        }
      : {
          address: {
            "@type": "PostalAddress",
            addressCountry: "IN",
          },
        }),
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    ...(params.sameAs?.length ? { sameAs: params.sameAs } : {}),
    knowsAbout: [
      "Overseas education loans",
      "Non-collateral education loans",
      "Student loans for studying abroad",
      "Education finance for UAE and Dubai",
      "Education loans for Ireland",
      "Education loans for Canada",
    ],
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Overseas Education Loan Assistance",
        description:
          "Education loan comparison and application support for Indian students studying abroad, including USA, UK, Canada, Ireland, Germany, Australia, and UAE/Dubai.",
        provider: { "@id": organizationId },
      },
    },
  };
}

export function websiteJsonLd(params: { name: string; url: string }) {
  const siteUrl = params.url.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: params.name,
    alternateName: ["Lakshya Edwise", "Lakshya International Edwise"],
    url: params.url,
    publisher: { "@id": `${siteUrl}/#organization` },
    inLanguage: "en-IN",
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function articleJsonLd(params: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  author: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.title,
    description: params.description,
    url: params.url,
    datePublished: params.datePublished,
    author: {
      "@type": "Person",
      name: params.author,
    },
    ...(params.image ? { image: params.image } : {}),
  };
}

export function serviceJsonLd(params: {
  name: string;
  description: string;
  url: string;
  provider: string;
  providerUrl?: string;
  areaServed?: string | string[];
}) {
  const providerUrl = (params.providerUrl ?? "").replace(/\/$/, "");
  const areas = Array.isArray(params.areaServed)
    ? params.areaServed
    : [params.areaServed ?? "IN"];

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: params.name,
    description: params.description,
    url: params.url,
    serviceType: "Education loan assistance",
    provider: providerUrl
      ? { "@id": `${providerUrl}/#organization` }
      : {
          "@type": "Organization",
          name: params.provider,
        },
    areaServed: areas.map((area) =>
      area.length === 2
        ? { "@type": "Country", name: area }
        : { "@type": "Place", name: area }
    ),
    audience: {
      "@type": "Audience",
      audienceType: "Indian students planning overseas education",
    },
  };
}

export function localBusinessJsonLd(params: {
  name: string;
  url: string;
  email?: string;
  phone?: string;
  address?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${params.url.replace(/\/$/, "")}/#localbusiness`,
    name: params.name,
    url: params.url,
    email: params.email,
    telephone: params.phone,
    priceRange: "$$",
    ...(params.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: params.address,
            addressCountry: "IN",
          },
        }
      : {
          address: {
            "@type": "PostalAddress",
            addressCountry: "IN",
          },
        }),
    areaServed: {
      "@type": "Country",
      name: "India",
    },
  };
}

export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
          .replace(/^#{2,3}\s+/gm, "")
          .replace(/^•\s+/gm, "- ")
          .trim(),
      },
    })),
  };
}

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
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "FinancialService"],
    name: params.name,
    url: params.url,
    email: params.email,
    telephone: params.phone,
    ...(params.logo ? { logo: params.logo } : {}),
    ...(params.address
      ? { address: { "@type": "PostalAddress", addressLocality: params.address } }
      : {}),
    ...(params.sameAs?.length ? { sameAs: params.sameAs } : {}),
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Overseas Education Loan Assistance",
        description:
          "Education loan comparison and assistance for students studying abroad in India.",
      },
    },
  };
}

export function websiteJsonLd(params: { name: string; url: string; searchUrl: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: params.name,
    url: params.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${params.searchUrl}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
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
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: params.name,
    description: params.description,
    url: params.url,
    provider: {
      "@type": "FinancialService",
      name: params.provider,
    },
    areaServed: "IN",
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
    "@type": "LocalBusiness",
    name: params.name,
    url: params.url,
    email: params.email,
    telephone: params.phone,
    ...(params.address
      ? { address: { "@type": "PostalAddress", addressLocality: params.address } }
      : {}),
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
        text: faq.answer,
      },
    })),
  };
}

interface JsonLdProps {
  data: Record<string, unknown>;
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
}) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: params.name,
    url: params.url,
    email: params.email,
    telephone: params.phone,
  };
}

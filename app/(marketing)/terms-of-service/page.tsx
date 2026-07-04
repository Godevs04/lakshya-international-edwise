import type { Metadata } from "next";
import { getMarketingContact } from "@/lib/config/marketing";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
import { LegalDocument } from "@/components/marketing/legal/legal-document";
import { TERMS_OF_SERVICE_SECTIONS } from "@/lib/constants/marketing/legal-content";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return buildMarketingMetadata({
    title: `Terms of Service | ${contact.companyName}`,
    description: `Terms governing use of the ${contact.companyName} website and education loan advisory services.`,
    path: "/terms-of-service",
  });
}

export default function TermsPage() {
  const contact = getMarketingContact();

  return (
    <LegalDocument
      title="Terms of Service"
      lastUpdated="July 2026"
      intro={`These terms govern your relationship with ${contact.companyName} when using our website and enquiry services for overseas education financing.`}
      sections={TERMS_OF_SERVICE_SECTIONS}
    />
  );
}

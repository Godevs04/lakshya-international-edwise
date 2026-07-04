import type { Metadata } from "next";
import { getMarketingContact } from "@/lib/config/marketing";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
import { LegalDocument } from "@/components/marketing/legal/legal-document";
import { PRIVACY_POLICY_SECTIONS } from "@/lib/constants/marketing/legal-content";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return buildMarketingMetadata({
    title: `Privacy Policy | ${contact.companyName}`,
    description: `How ${contact.companyName} collects, uses, and protects your personal data for education loan enquiries and related services.`,
    path: "/privacy-policy",
  });
}

export default function PrivacyPolicyPage() {
  const contact = getMarketingContact();

  return (
    <LegalDocument
      title="Privacy Policy"
      lastUpdated="July 2026"
      intro={`${contact.companyName} is committed to protecting your privacy. This policy describes how we handle personal information when you use our website, submit loan enquiries, or communicate with our counsellors.`}
      sections={PRIVACY_POLICY_SECTIONS}
    />
  );
}

import type { Metadata } from "next";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return {
    title: `Privacy Policy | ${contact.companyName}`,
    alternates: { canonical: `${getSiteUrl()}/privacy-policy` },
  };
}

export default function PrivacyPolicyPage() {
  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-3xl px-4 prose prose-slate">
        <h1>Privacy Policy</h1>
        <p>
          Lakshya International Edwise respects your privacy. Information submitted through our website forms is used
          only to provide counselling, admissions, and education loan services.
        </p>
        <p>
          We do not sell personal data. Data may be shared with partner universities and lenders only when required to
          process your application with your consent.
        </p>
        <p>For privacy requests, contact us through the details on our contact page.</p>
      </div>
    </section>
  );
}

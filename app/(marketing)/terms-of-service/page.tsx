import type { Metadata } from "next";
import { getMarketingContact } from "@/lib/config/marketing";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return buildMarketingMetadata({
    title: `Terms of Service | ${contact.companyName}`,
    description: `Terms of service for using the ${contact.companyName} website and counselling services.`,
    path: "/terms-of-service",
  });
}

export default function TermsPage() {
  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-3xl px-4 prose prose-slate">
        <h1>Terms of Service</h1>
        <p>
          By using this website, you agree to receive communication from Lakshya International Edwise regarding your
          enquiry and related services.
        </p>
        <p>
          Counselling outcomes depend on university decisions, visa authorities, and lender policies. We provide
          professional guidance but cannot guarantee admission, visa approval, or loan sanction.
        </p>
        <p>These terms may be updated periodically. Continued use of the website constitutes acceptance.</p>
      </div>
    </section>
  );
}

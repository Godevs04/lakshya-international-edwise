import type { Metadata } from "next";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return {
    title: `Terms of Service | ${contact.companyName}`,
    alternates: { canonical: `${getSiteUrl()}/terms-of-service` },
  };
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

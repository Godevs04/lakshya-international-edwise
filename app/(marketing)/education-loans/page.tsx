import type { Metadata } from "next";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { LeadForm } from "@/components/marketing/forms/lead-form";
import { FaqSection } from "@/components/marketing/sections/faq";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { BankingPartnersSection } from "@/components/marketing/sections/banking-partners";
import { MARKETING_LOAN_FAQS } from "@/lib/constants/marketing/faqs";
import { getMarketingContact } from "@/lib/config/marketing";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return buildMarketingMetadata({
    title: `Education Loans | ${contact.companyName}`,
    description:
      "Compare education loan lenders, eligibility, documents, and disbursement support for study abroad students in India.",
    path: "/education-loans",
  });
}

const processSteps = [
  "Profile and admission review",
  "Lender shortlisting and eligibility check",
  "Document preparation and submission",
  "Sanction, agreement, and disbursement tracking",
];

export default function EducationLoansPage() {
  return (
    <>
      <section className="hero-gradient section-padding">
        <div className="container mx-auto grid max-w-6xl items-start gap-8 px-4 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              Education Loans
            </p>
            <h1 className="heading-display text-secondary">Secure funding for your international degree</h1>
            <p className="prose-marketing mt-5 text-lg text-muted-foreground">
              We partner with trusted lenders to help you compare rates, prepare documents, and track loan status end to end.
            </p>
          </div>
          <LeadForm variant="loan" formPage="/education-loans" premium />
        </div>
      </section>

      <BankingPartnersSection />

      <SectionShell variant="white" title="Our loan process" eyebrow="Process">
        <ol className="mx-auto max-w-2xl space-y-3">
          {processSteps.map((step, index) => (
            <li key={step} className="card-premium flex items-center gap-4 px-5 py-4 text-sm text-secondary/90">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </SectionShell>

      <FaqSection items={MARKETING_LOAN_FAQS} title="Education loan FAQs" />
      <CtaBanner title="Apply for education loan guidance" />
    </>
  );
}

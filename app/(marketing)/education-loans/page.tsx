import type { Metadata } from "next";
import Image from "next/image";
import { SectionHeading } from "@/components/marketing/sections/section-heading";
import { LeadForm } from "@/components/marketing/forms/lead-form";
import { FaqSection } from "@/components/marketing/sections/faq";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { MARKETING_LENDERS } from "@/lib/constants/marketing/lenders";
import { MARKETING_LOAN_FAQS } from "@/lib/constants/marketing/faqs";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return {
    title: `Education Loans | ${contact.companyName}`,
    description: "Compare education loan lenders, eligibility, documents, and disbursement support.",
    alternates: { canonical: `${getSiteUrl()}/education-loans` },
  };
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
        <div className="container mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Education Loans"
            title="Secure funding for your international degree"
            description="We partner with trusted lenders to help you compare rates, prepare documents, and track loan status end to end."
          />
          <LeadForm variant="loan" formPage="/education-loans" />
        </div>
      </section>

      <section className="section-padding">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="mb-6 text-2xl font-bold text-secondary">Partner lenders</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {MARKETING_LENDERS.map((lender) => (
              <div key={lender.slug} className="glass-card flex items-center justify-center rounded-2xl p-4">
                <Image src={lender.logo} alt={lender.name} width={120} height={32} className="h-8 w-auto object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted/20">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-4 text-2xl font-bold text-secondary">Our loan process</h2>
          <ol className="space-y-3">
            {processSteps.map((step, index) => (
              <li key={step} className="glass-card rounded-xl px-4 py-3 text-sm text-secondary/90">
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <FaqSection items={MARKETING_LOAN_FAQS} title="Education loan FAQs" />
      <CtaBanner title="Apply for education loan guidance" />
    </>
  );
}

import type { Metadata } from "next";
import { Mail, Phone, Clock } from "lucide-react";
import { PageHero } from "@/components/marketing/sections/page-hero";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { ContactForm } from "@/components/marketing/forms/contact-form";
import { LeadForm } from "@/components/marketing/forms/lead-form";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { OfficeLocationShowcase } from "@/components/marketing/maps/office-location-showcase";
import { JsonLd, localBusinessJsonLd } from "@/components/marketing/seo/json-ld";
import { MARKETING_OFFICE_HOURS } from "@/lib/constants/marketing/offices";
import { getMarketingContact, getSiteUrl, getWhatsAppLink } from "@/lib/config/marketing";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return buildMarketingMetadata({
    title: `Contact Us | ${contact.companyName}`,
    description:
      "Reach Lakshya International Edwise for education loan guidance, forex, and study-abroad financing. We respond within one business day.",
    path: "/contact",
  });
}

export default function ContactPage() {
  const contact = getMarketingContact();
  const whatsapp = getWhatsAppLink("Hello, I would like to check my education loan eligibility.");

  return (
    <>
      <JsonLd
        data={localBusinessJsonLd({
          name: contact.companyName,
          url: getSiteUrl(),
          email: contact.email,
          phone: contact.phone,
          address: "India",
        })}
      />
      <PageHero
        eyebrow="Contact"
        title="Talk to our loan experts"
        description="Reach out for education loan guidance. We respond within one business day."
      />

      <SectionShell variant="white" padding>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <ContactForm />
            <div className="rounded-2xl border border-border/60 bg-accent/30 p-5">
              <h3 className="text-sm font-semibold text-foreground">
                Prefer a faster loan check?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Compare offers across 20+ lenders in under 7 minutes.
              </p>
              <EligibilityCta source="contact-page" className="mt-4 px-6 py-2.5 text-sm" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="card-premium p-6">
              <h2 className="text-lg font-semibold text-foreground">Office contact</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {contact.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <a href={`tel:${contact.phone}`} className="hover:text-secondary">
                      {contact.phone}
                    </a>
                  </li>
                )}
                {contact.email && (
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href={`mailto:${contact.email}`} className="hover:text-secondary">
                      {contact.email}
                    </a>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  {MARKETING_OFFICE_HOURS}
                </li>
              </ul>
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-marketing mt-4 inline-flex rounded-full px-4 py-2 text-sm font-semibold"
                >
                  Chat on WhatsApp
                </a>
              )}
            </div>
            {contact.mapCenter ? (
              <OfficeLocationShowcase
                center={contact.mapCenter}
                title={contact.officeName}
                address={contact.address}
                phone={contact.phone}
                hours={contact.officeHours}
                compact
              />
            ) : null}
          </div>
        </div>
      </SectionShell>

      <SectionShell variant="muted" padding>
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-center">
            <p className="accent-chip mx-auto">Free Consultation</p>
            <h2 className="heading-section mt-3 text-foreground">
              Book a personalised loan consultation
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Share your study plans and we will map the best lender options for your profile.
            </p>
          </div>
          <LeadForm variant="consultation" formPage="/contact" premium />
        </div>
      </SectionShell>
    </>
  );
}

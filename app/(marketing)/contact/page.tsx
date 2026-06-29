import type { Metadata } from "next";
import { Mail, Phone, Clock } from "lucide-react";
import { SectionHeading } from "@/components/marketing/sections/section-heading";
import { LeadForm } from "@/components/marketing/forms/lead-form";
import { getMarketingContact, getSiteUrl, getWhatsAppLink } from "@/lib/config/marketing";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return {
    title: `Contact Us | ${contact.companyName}`,
    description: "Reach Lakshya International Edwise for study abroad counselling and education loan support.",
    alternates: { canonical: `${getSiteUrl()}/contact` },
  };
}

export default function ContactPage() {
  const contact = getMarketingContact();
  const whatsapp = getWhatsAppLink("Hello, I would like to book a consultation.");

  return (
    <>
      <section className="hero-gradient section-padding">
        <div className="container mx-auto max-w-4xl px-4">
          <SectionHeading
            eyebrow="Contact"
            title="Speak with our counsellors"
            description="Share your profile and goals. We respond within one business day."
          />
        </div>
      </section>

      <section className="section-padding">
        <div className="container mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-2">
          <LeadForm variant="contact" formPage="/contact" />
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-secondary">Office contact</h2>
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
                  Mon - Sat, 10:00 AM - 7:00 PM IST
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
            {contact.mapsEmbed && (
              <div className="overflow-hidden rounded-2xl border border-border">
                <iframe
                  title="Office location"
                  src={contact.mapsEmbed}
                  className="h-64 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

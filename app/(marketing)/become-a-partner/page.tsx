import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/sections/page-hero";
import { MarketingContainer } from "@/components/marketing/layout/marketing-container";
import { PartnerLeadForm } from "@/components/marketing/forms/partner-lead-form";
import { PartnerHandshakePanel } from "@/components/marketing/sections/partner-handshake-panel";
import { JsonLd, breadcrumbJsonLd } from "@/components/marketing/seo/json-ld";
import { getMarketingContact } from "@/lib/config/marketing";
import { buildMarketingMetadata, getAbsoluteUrl } from "@/lib/seo/marketing-metadata";
import { HeartHandshake, TrendingUp, ShieldCheck } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return buildMarketingMetadata({
    title: `Become a Partner | ${contact.companyName}`,
    description:
      "Partner with Lakshya to offer your students fast, affordable education loans — without any channel conflict. We fund the finance, you keep your students.",
    path: "/become-a-partner",
  });
}

const BENEFITS = [
  {
    icon: HeartHandshake,
    title: "Zero channel conflict",
    description: "We only handle finance. Your students and admissions commissions stay yours.",
  },
  {
    icon: TrendingUp,
    title: "Faster approvals",
    description: "73-hour approvals across 20+ lenders keep your students moving.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted process",
    description: "Transparent, compliant lending support your students can rely on.",
  },
];

export default function BecomePartnerPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: getAbsoluteUrl("/") },
          { name: "Become a Partner", url: getAbsoluteUrl("/become-a-partner") },
        ])}
      />
      <PageHero
        eyebrow="Become a Partner"
        title="Grow with a finance partner"
        titleAccent="who won't compete for your students"
        description="Refer students for education loans and let us handle the funding end-to-end — you focus on admissions."
      />

      <section className="section-padding page-section-premium section-white">
        <MarketingContainer size="premium">
          <div className="partner-page-layout grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="partner-page-aside space-y-4">
              <PartnerHandshakePanel />
              {BENEFITS.map(({ icon: Icon, title, description }) => (
                <div key={title} className="card-premium flex gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="glass-form-panel rounded-3xl p-6 md:p-8">
              <PartnerLeadForm />
            </div>
          </div>
        </MarketingContainer>
      </section>
    </>
  );
}

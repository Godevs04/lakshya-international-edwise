import type { Metadata } from "next";
import "./marketing.css";
import { fontMarketing } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { MarketingNavbar } from "@/components/marketing/layout/navbar";
import { MarketingFooter } from "@/components/marketing/layout/footer";
import { FloatingContactBar } from "@/components/marketing/layout/floating-contact-bar";
import { InactivityEligibilityPrompt } from "@/components/marketing/layout/inactivity-eligibility-prompt";
import { EligibilityModalProvider } from "@/components/marketing/eligibility/eligibility-modal-provider";
import { JsonLd, organizationJsonLd } from "@/components/marketing/seo/json-ld";
import { getMarketingContact, getSiteUrl, getWhatsAppLink } from "@/lib/config/marketing";
import {
  buildMarketingLayoutMetadata,
  getDefaultOgImageUrl,
} from "@/lib/seo/marketing-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingLayoutMetadata();
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const contact = getMarketingContact();
  const siteUrl = getSiteUrl();
  const sameAs = Object.values(contact.social).filter((url): url is string => Boolean(url));
  const whatsappLink = getWhatsAppLink(
    "Hello, I would like to check my education loan eligibility."
  );

  return (
    <div className={cn("marketing-site min-h-screen", fontMarketing.variable)}>
      <JsonLd
        data={organizationJsonLd({
          name: contact.companyName,
          url: siteUrl,
          email: contact.email,
          phone: contact.phone,
          logo: getDefaultOgImageUrl(),
          sameAs,
          address: contact.phone ? undefined : "India",
        })}
      />
      <EligibilityModalProvider>
        <MarketingNavbar companyName={contact.companyName} />
        <main className="marketing-premium">{children}</main>
        <MarketingFooter />
        <FloatingContactBar whatsappLink={whatsappLink} phone={contact.phone} />
        <InactivityEligibilityPrompt />
      </EligibilityModalProvider>
    </div>
  );
}

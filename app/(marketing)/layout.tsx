import "./marketing.css";
import { MarketingNavbar } from "@/components/marketing/layout/navbar";
import { MarketingFooter } from "@/components/marketing/layout/footer";
import { StickyCta } from "@/components/marketing/layout/sticky-cta";
import { EnquiryDialog } from "@/components/marketing/layout/enquiry-dialog";
import { JsonLd, organizationJsonLd } from "@/components/marketing/seo/json-ld";
import { getMarketingContact, getSiteUrl, getWhatsAppLink } from "@/lib/config/marketing";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const contact = getMarketingContact();
  const siteUrl = getSiteUrl();

  return (
    <div className="marketing-site min-h-screen">
      <JsonLd
        data={organizationJsonLd({
          name: contact.companyName,
          url: siteUrl,
          email: contact.email,
          phone: contact.phone,
        })}
      />
      <MarketingNavbar companyName={contact.companyName} />
      <main>{children}</main>
      <MarketingFooter />
      <StickyCta whatsappLink={getWhatsAppLink("Hello, I would like to enquire about study abroad counselling.")} />
      <EnquiryDialog />
    </div>
  );
}

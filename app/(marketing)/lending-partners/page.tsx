import type { Metadata } from "next";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { LendingPartnersExplorer } from "@/components/marketing/lenders/lending-partners-explorer";
import { LendingPartnersHero } from "@/components/marketing/lenders/lending-partners-hero";
import { JsonLd, breadcrumbJsonLd } from "@/components/marketing/seo/json-ld";
import { MARKETING_LENDERS } from "@/lib/constants/marketing/lenders";
import { getMarketingContact } from "@/lib/config/marketing";
import { buildMarketingMetadata, getAbsoluteUrl } from "@/lib/seo/marketing-metadata";
import "./lending-partners-premium.css";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return buildMarketingMetadata({
    title: `Lending Partners | ${contact.companyName}`,
    description:
      "Compare 20+ education loan partners — government banks, private banks, NBFCs, and international lenders. Lowest interest rates, no-collateral options, and fast approvals.",
    path: "/lending-partners",
  });
}

export default function LendingPartnersPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: MARKETING_LENDERS.map((lender, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: lender.name,
    })),
  };

  return (
    <div className="lending-partners-page">
      <JsonLd
        data={[
          itemList,
          breadcrumbJsonLd([
            { name: "Home", url: getAbsoluteUrl("/") },
            { name: "Lending Partners", url: getAbsoluteUrl("/lending-partners") },
          ]),
        ]}
      />
      <LendingPartnersHero />
      <SectionShell
        variant="white"
        padding
        className="lender-marketplace-section services-section-premium page-section-premium"
        containerClassName="max-w-[90rem]"
      >
        <div className="services-bento-bg-orbs" aria-hidden>
          <span className="services-bento-bg-orb services-bento-bg-orb-1" />
          <span className="services-bento-bg-orb services-bento-bg-orb-2" />
          <span className="services-bento-bg-orb services-bento-bg-orb-3" />
        </div>
        <LendingPartnersExplorer />
      </SectionShell>
      <CtaBanner source="lending-partners-banner" />
    </div>
  );
}

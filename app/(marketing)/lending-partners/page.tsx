import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/sections/page-hero";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { LendingPartnersExplorer } from "@/components/marketing/lenders/lending-partners-explorer";
import { JsonLd, breadcrumbJsonLd } from "@/components/marketing/seo/json-ld";
import { MARKETING_LENDERS } from "@/lib/constants/marketing/lenders";
import { getMarketingContact } from "@/lib/config/marketing";
import { buildMarketingMetadata, getAbsoluteUrl } from "@/lib/seo/marketing-metadata";

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
    <>
      <JsonLd
        data={[
          itemList,
          breadcrumbJsonLd([
            { name: "Home", url: getAbsoluteUrl("/") },
            { name: "Lending Partners", url: getAbsoluteUrl("/lending-partners") },
          ]),
        ]}
      />
      <PageHero
        eyebrow="Lending Partners"
        title="One application, every top lender compared"
        description="Government banks for the lowest rates, NBFCs for speed, and international lenders for no-collateral funding — we match you to the best fit."
      />
      <SectionShell variant="white">
        <LendingPartnersExplorer />
      </SectionShell>
      <CtaBanner source="lending-partners-banner" />
    </>
  );
}

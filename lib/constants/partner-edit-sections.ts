export type PartnerEditSectionKey = "company" | "contacts" | "bank";

export const PARTNER_EDIT_SECTIONS: Record<
  PartnerEditSectionKey,
  { label: string; formSections: string[]; scrollTarget: string }
> = {
  company: {
    label: "Company details",
    formSections: ["required", "company"],
    scrollTarget: "section-required",
  },
  contacts: {
    label: "Points of contact",
    formSections: ["contacts"],
    scrollTarget: "section-contacts",
  },
  bank: {
    label: "Bank details",
    formSections: ["bank"],
    scrollTarget: "section-bank",
  },
};

export function parsePartnerEditSection(
  value?: string | null
): PartnerEditSectionKey | undefined {
  if (!value) return undefined;
  return value in PARTNER_EDIT_SECTIONS ? (value as PartnerEditSectionKey) : undefined;
}

export function getPartnerEditHref(partnerId: string, section: PartnerEditSectionKey) {
  return `/dashboard/partners/${partnerId}/edit?section=${section}`;
}

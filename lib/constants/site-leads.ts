import { STUDENT_RECORD_TYPE } from "@/lib/constants/student-record-type";

export const SITE_LEAD_PROMOTION_STATUS = {
  PENDING: "pending",
  PROMOTED: "promoted",
} as const;

export type SiteLeadPromotionStatus =
  (typeof SITE_LEAD_PROMOTION_STATUS)[keyof typeof SITE_LEAD_PROMOTION_STATUS];

export const SITE_LEAD_SOURCE = {
  WEBSITE: "website",
} as const;

export const SITE_LEADS_TABS = ["students", "partners"] as const;
export type SiteLeadsTab = (typeof SITE_LEADS_TABS)[number];

/** Pending website student leads in the From Site inbox. */
export function websitePendingStudentLeadsFilter() {
  return {
    recordType: STUDENT_RECORD_TYPE.ADMISSION,
    "metadata.leadSource": SITE_LEAD_SOURCE.WEBSITE,
    $or: [
      { "metadata.promotionStatus": { $exists: false } },
      { "metadata.promotionStatus": SITE_LEAD_PROMOTION_STATUS.PENDING },
    ],
  };
}

/** Manual admission leads only (excludes website-sourced leads). */
export function manualAdmissionLeadsFilter() {
  return {
    recordType: STUDENT_RECORD_TYPE.ADMISSION,
    $or: [
      { "metadata.leadSource": { $exists: false } },
      { "metadata.leadSource": { $ne: SITE_LEAD_SOURCE.WEBSITE } },
    ],
  };
}

/** Pending website partner leads in the From Site inbox. */
export function websitePendingPartnerLeadsFilter() {
  return {
    status: "pending" as const,
    "metadata.leadSource": SITE_LEAD_SOURCE.WEBSITE,
    $or: [
      { "metadata.promotionStatus": { $exists: false } },
      { "metadata.promotionStatus": SITE_LEAD_PROMOTION_STATUS.PENDING },
    ],
  };
}

/** Official partners list — excludes unpromoted website leads. */
export function officialPartnersFilter() {
  return {
    $or: [
      { "metadata.leadSource": { $exists: false } },
      { "metadata.leadSource": { $ne: SITE_LEAD_SOURCE.WEBSITE } },
      { "metadata.promotionStatus": SITE_LEAD_PROMOTION_STATUS.PROMOTED },
    ],
  };
}

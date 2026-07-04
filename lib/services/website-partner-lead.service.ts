import { connectDB } from "@/lib/db/mongoose";
import { Partner } from "@/models/Partner";
import {
  SITE_LEAD_PROMOTION_STATUS,
  SITE_LEAD_SOURCE,
} from "@/lib/constants/site-leads";
import { allocateWebsitePartnerLeadCode } from "@/lib/services/partner-id.service";

/** Pending website partner rows that lost metadata during a stale Mongoose model reload. */
function legacyWebsitePartnerLeadsFilter() {
  return {
    status: "pending" as const,
    "metadata.createdByName": "Website",
    $or: [
      { "metadata.leadSource": { $exists: false } },
      { "metadata.leadSource": { $ne: SITE_LEAD_SOURCE.WEBSITE } },
      { partnerCode: { $exists: false } },
      { partnerCode: null },
      { partnerCode: "" },
      { "metadata.promotionStatus": { $exists: false } },
    ],
  };
}

export async function repairLegacyWebsitePartnerLeads(): Promise<number> {
  await connectDB();

  const broken = await Partner.find(legacyWebsitePartnerLeadsFilter())
    .select("_id partnerCode metadata location")
    .lean();

  if (!broken.length) return 0;

  let repaired = 0;
  for (const partner of broken) {
    const partnerCode = partner.partnerCode?.trim() || (await allocateWebsitePartnerLeadCode());

    await Partner.updateOne(
      { _id: partner._id },
      {
        $set: {
          partnerCode,
          "metadata.leadSource": SITE_LEAD_SOURCE.WEBSITE,
          "metadata.promotionStatus":
            partner.metadata?.promotionStatus ?? SITE_LEAD_PROMOTION_STATUS.PENDING,
          "metadata.formCity": partner.metadata?.formCity ?? partner.location?.city,
          "metadata.isOwner": partner.metadata?.isOwner,
        },
      }
    );
    repaired += 1;
  }

  return repaired;
}

export async function ensureWebsitePartnerLeadRecord(partnerId: string): Promise<void> {
  await connectDB();

  const partner = await Partner.findById(partnerId)
    .select("partnerCode metadata location status")
    .lean();

  if (!partner || partner.status !== "pending") return;

  const needsRepair =
    partner.metadata?.leadSource !== SITE_LEAD_SOURCE.WEBSITE ||
    !partner.partnerCode?.trim() ||
    !partner.metadata?.promotionStatus;

  if (!needsRepair) return;

  const partnerCode = partner.partnerCode?.trim() || (await allocateWebsitePartnerLeadCode());

  await Partner.updateOne(
    { _id: partnerId },
    {
      $set: {
        partnerCode,
        "metadata.leadSource": SITE_LEAD_SOURCE.WEBSITE,
        "metadata.promotionStatus":
          partner.metadata?.promotionStatus ?? SITE_LEAD_PROMOTION_STATUS.PENDING,
        "metadata.formCity": partner.metadata?.formCity ?? partner.location?.city,
        "metadata.isOwner": partner.metadata?.isOwner,
      },
    }
  );
}

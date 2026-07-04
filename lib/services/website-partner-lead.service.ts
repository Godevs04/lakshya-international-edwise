import { connectDB } from "@/lib/db/mongoose";
import { Partner } from "@/models/Partner";
import { Activity } from "@/models/Activity";
import {
  SITE_LEAD_PROMOTION_STATUS,
  SITE_LEAD_SOURCE,
} from "@/lib/constants/site-leads";
import { allocateWebsitePartnerLeadCode } from "@/lib/services/partner-id.service";

/** Pending website partner rows missing inbox metadata or owner/WhatsApp fields. */
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
      {
        "metadata.leadSource": SITE_LEAD_SOURCE.WEBSITE,
        "metadata.isOwner": { $exists: false },
      },
      {
        "metadata.leadSource": SITE_LEAD_SOURCE.WEBSITE,
        "metadata.whatsapp": { $exists: false },
      },
    ],
  };
}

async function resolvePartnerLeadMetadata(partner: {
  _id: { toString(): string };
  phone?: string;
  metadata?: {
    isOwner?: boolean;
    whatsapp?: string;
    formCity?: string;
    promotionStatus?: string;
  };
}) {
  let isOwner = partner.metadata?.isOwner;
  let whatsapp = partner.metadata?.whatsapp?.trim();

  if (isOwner === undefined || !whatsapp) {
    const activity = await Activity.findOne({
      action: "site_lead.partner_created",
      resourceId: partner._id.toString(),
    })
      .select("metadata")
      .lean();

    if (isOwner === undefined && typeof activity?.metadata?.isOwner === "boolean") {
      isOwner = activity.metadata.isOwner;
    }
    if (!whatsapp && typeof activity?.metadata?.whatsapp === "string") {
      whatsapp = activity.metadata.whatsapp.trim();
    }
  }

  if (!whatsapp && partner.phone?.trim()) {
    whatsapp = partner.phone.trim();
  }

  return { isOwner, whatsapp };
}

export async function repairLegacyWebsitePartnerLeads(): Promise<number> {
  await connectDB();

  const broken = await Partner.find(legacyWebsitePartnerLeadsFilter())
    .select("_id partnerCode metadata location phone")
    .lean();

  if (!broken.length) return 0;

  let repaired = 0;
  for (const partner of broken) {
    const partnerCode = partner.partnerCode?.trim() || (await allocateWebsitePartnerLeadCode());
    const { isOwner, whatsapp } = await resolvePartnerLeadMetadata(partner);

    await Partner.updateOne(
      { _id: partner._id },
      {
        $set: {
          partnerCode,
          "metadata.leadSource": SITE_LEAD_SOURCE.WEBSITE,
          "metadata.promotionStatus":
            partner.metadata?.promotionStatus ?? SITE_LEAD_PROMOTION_STATUS.PENDING,
          "metadata.formCity": partner.metadata?.formCity ?? partner.location?.city,
          ...(isOwner !== undefined ? { "metadata.isOwner": isOwner } : {}),
          ...(whatsapp ? { "metadata.whatsapp": whatsapp } : {}),
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
    .select("partnerCode metadata location status phone")
    .lean();

  if (!partner || partner.status !== "pending") return;

  const needsRepair =
    partner.metadata?.leadSource !== SITE_LEAD_SOURCE.WEBSITE ||
    !partner.partnerCode?.trim() ||
    !partner.metadata?.promotionStatus ||
    partner.metadata?.isOwner === undefined ||
    !partner.metadata?.whatsapp?.trim();

  if (!needsRepair) return;

  const partnerCode = partner.partnerCode?.trim() || (await allocateWebsitePartnerLeadCode());
  const { isOwner, whatsapp } = await resolvePartnerLeadMetadata(partner);

  await Partner.updateOne(
    { _id: partnerId },
    {
      $set: {
        partnerCode,
        "metadata.leadSource": SITE_LEAD_SOURCE.WEBSITE,
        "metadata.promotionStatus":
          partner.metadata?.promotionStatus ?? SITE_LEAD_PROMOTION_STATUS.PENDING,
        "metadata.formCity": partner.metadata?.formCity ?? partner.location?.city,
        ...(isOwner !== undefined ? { "metadata.isOwner": isOwner } : {}),
        ...(whatsapp ? { "metadata.whatsapp": whatsapp } : {}),
      },
    }
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/mongoose";
import { Partner } from "@/models/Partner";
import { logActivity } from "@/lib/services/activity.service";
import { sendPartnerEnquiryNotification } from "@/lib/services/email.service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { partnerEnquirySchema } from "@/lib/validations/schemas";
import { normalizeIndianPhone } from "@/lib/validations/indian-fields";
import { sanitizeText } from "@/lib/utils/sanitize";
import { allocateWebsitePartnerLeadCode } from "@/lib/services/partner-id.service";
import { ensureWebsitePartnerLeadRecord } from "@/lib/services/website-partner-lead.service";
import {
  SITE_LEAD_PROMOTION_STATUS,
  SITE_LEAD_SOURCE,
} from "@/lib/constants/site-leads";
import { revalidateInsightCaches } from "@/lib/cache/revalidate";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types";

export async function submitPartnerEnquiryAction(
  formData: FormData
): Promise<ActionResult<{ ok: true }>> {
  try {
    const ip = await getClientIp();
    const rateLimit = await checkRateLimit("website-enquiry", ip);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Too many submissions. Please try again in ${rateLimit.retryAfterSeconds} seconds.`,
      };
    }

    const raw = Object.fromEntries(formData.entries());
    const parsed = partnerEnquirySchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
      };
    }

    if (parsed.data.website) {
      return { success: true, data: { ok: true } };
    }

    const data = parsed.data;
    const whatsapp = data.mobileIsWhatsapp
      ? normalizeIndianPhone(data.phone)
      : data.whatsapp?.trim()
        ? normalizeIndianPhone(data.whatsapp)
        : undefined;

    await connectDB();

    const partnerCode = await allocateWebsitePartnerLeadCode();
    const partner = await Partner.create({
      partnerCode,
      companyName: sanitizeText(data.companyName),
      owner: sanitizeText(data.name),
      phone: normalizeIndianPhone(data.phone),
      email: data.email.trim().toLowerCase(),
      location: { city: sanitizeText(data.city) },
      actionStatus: "need_action",
      commissionPercent: 0,
      status: "pending",
      metadata: {
        createdByName: "Website",
        leadSource: SITE_LEAD_SOURCE.WEBSITE,
        promotionStatus: SITE_LEAD_PROMOTION_STATUS.PENDING,
        isOwner: data.isOwner,
        formCity: sanitizeText(data.city),
      },
    });

    await ensureWebsitePartnerLeadRecord(partner._id.toString());

    await sendPartnerEnquiryNotification({
      name: sanitizeText(data.name),
      email: data.email.trim(),
      phone: normalizeIndianPhone(data.phone),
      companyName: sanitizeText(data.companyName),
      city: sanitizeText(data.city),
      isOwner: data.isOwner,
      whatsapp,
    });

    await logActivity({
      action: "site_lead.partner_created",
      description: `Website partner lead from ${data.companyName} (${partnerCode})`,
      resourceType: "partner",
      resourceId: partner._id.toString(),
      userName: "Website",
      metadata: { leadSource: SITE_LEAD_SOURCE.WEBSITE, city: data.city, isOwner: data.isOwner },
    });

    revalidatePath("/dashboard/site-leads");
    revalidateInsightCaches();

    return { success: true, data: { ok: true } };
  } catch (error) {
    logger.error("submitPartnerEnquiryAction failed", error);
    return { success: false, error: "Unable to submit your enquiry. Please try again." };
  }
}

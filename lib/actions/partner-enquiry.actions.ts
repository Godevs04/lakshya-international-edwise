"use server";

import { logActivity } from "@/lib/services/activity.service";
import { sendPartnerEnquiryNotification } from "@/lib/services/email.service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { partnerEnquirySchema } from "@/lib/validations/schemas";
import { normalizeIndianPhone } from "@/lib/validations/indian-fields";
import { sanitizeText } from "@/lib/utils/sanitize";
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
      action: "partner.enquiry",
      description: `Partner enquiry from ${data.companyName} (${data.name})`,
      resourceType: "partner",
      userName: "Website",
      metadata: { leadSource: "website", city: data.city, isOwner: data.isOwner },
    });

    return { success: true, data: { ok: true } };
  } catch (error) {
    logger.error("submitPartnerEnquiryAction failed", error);
    return { success: false, error: "Unable to submit your enquiry. Please try again." };
  }
}

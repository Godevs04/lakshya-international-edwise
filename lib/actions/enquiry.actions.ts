"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { Application } from "@/models/Application";
import { STUDENT_RECORD_TYPE } from "@/lib/constants/student-record-type";
import { allocateWebsiteLeadId } from "@/lib/services/student-id.service";
import {
  SITE_LEAD_PROMOTION_STATUS,
  SITE_LEAD_SOURCE,
} from "@/lib/constants/site-leads";
import { logActivity } from "@/lib/services/activity.service";
import { sendWebsiteEnquiryNotification } from "@/lib/services/email.service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { websiteEnquirySchema } from "@/lib/validations/schemas";
import { normalizeIndianPhone } from "@/lib/validations/indian-fields";
import { findStudentWithPhone } from "@/lib/services/student-phone.service";
import { splitFullName } from "@/lib/utils/person-name";
import { sanitizeText } from "@/lib/utils/sanitize";
import { revalidateInsightCaches } from "@/lib/cache/revalidate";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types";

export async function submitWebsiteEnquiryAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
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
    const parsed = websiteEnquirySchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
      };
    }

    if (parsed.data.website) {
      return { success: true, data: { id: "ok" } };
    }

    const data = parsed.data;
    await connectDB();

    if (data.phone?.trim()) {
      const phoneDuplicate = await findStudentWithPhone(data.phone);
      if (phoneDuplicate) {
        return {
          success: false,
          error:
            "We already have your enquiry on file. Our team will contact you shortly.",
        };
      }
    }

    const { firstName, lastName } = splitFullName(data.name);
    const studentId = await allocateWebsiteLeadId();
    const noteLines = [
      `Enquiry type: ${data.enquiryType}`,
      data.formPage ? `Submitted from: ${data.formPage}` : null,
      data.loanRequired ? "Education loan required: Yes" : null,
      data.loanAmount?.trim() ? `Loan amount: ${data.loanAmount.trim()}` : null,
      data.currentStatus?.trim() ? `Current status: ${data.currentStatus.trim()}` : null,
      data.preferredLender?.trim() ? `Preferred lender: ${data.preferredLender.trim()}` : null,
      data.message?.trim() ? `Message: ${data.message.trim()}` : null,
    ].filter(Boolean);

    const student = await Student.create({
      studentId,
      firstName: sanitizeText(firstName),
      lastName: sanitizeText(lastName),
      phone: normalizeIndianPhone(data.phone),
      email: data.email?.trim() || undefined,
      targetCountry: data.targetCountry?.trim() || undefined,
      education: data.course?.trim() ? { course: sanitizeText(data.course) } : undefined,
      recordType: STUDENT_RECORD_TYPE.ADMISSION,
      applicationStatus: "docs_pending",
      loggedIn: false,
      loan: {
        requested: data.loanRequired ? 1 : 0,
      },
      status: "new",
      timeline: [{ status: "new", createdByName: "Website", createdAt: new Date() }],
      notes: noteLines.length
        ? [
            {
              content: noteLines.join("\n"),
              createdByName: "Website",
              createdAt: new Date(),
            },
          ]
        : [],
      metadata: {
        createdByName: "Website",
        leadSource: SITE_LEAD_SOURCE.WEBSITE,
        enquiryType: data.enquiryType,
        formPage: data.formPage,
        promotionStatus: SITE_LEAD_PROMOTION_STATUS.PENDING,
        ip,
      },
    });

    await Application.create({
      studentId: student._id,
      loanAmount: 0,
      status: "new",
      pipelineStage: "new",
      metadata: { createdByName: "Website" },
    });

    await logActivity({
      action: "site_lead.student_created",
      description: `Website student lead from ${data.name} (${studentId})`,
      resourceType: "student",
      resourceId: student._id.toString(),
      userName: "Website",
      metadata: {
        leadSource: "website",
        enquiryType: data.enquiryType,
        formPage: data.formPage,
      },
    });

    await sendWebsiteEnquiryNotification({
      name: data.name,
      phone: data.phone,
      email: data.email,
      targetCountry: data.targetCountry,
      course: data.course,
      loanRequired: data.loanRequired,
      message: data.message,
      enquiryType: data.enquiryType,
      formPage: data.formPage,
      studentCode: studentId,
    });

    revalidatePath("/dashboard/site-leads");
    revalidatePath("/dashboard/overview");
    revalidateInsightCaches();

    return { success: true, data: { id: student._id.toString() } };
  } catch (error) {
    logger.error("submitWebsiteEnquiryAction failed", error);
    return { success: false, error: "Unable to submit your enquiry. Please try again." };
  }
}

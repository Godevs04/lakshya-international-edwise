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
import { parseWebsiteLoanAmount } from "@/lib/utils/website-loan-amount";
import { sanitizeText } from "@/lib/utils/sanitize";
import {
  findPendingWebsiteStudentLeadByPhone,
  updatePendingWebsiteStudentLead,
} from "@/lib/services/website-student-lead.service";
import { revalidateInsightCaches } from "@/lib/cache/revalidate";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types";

export async function submitWebsiteEnquiryAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const ip = await getClientIp();
    const rateLimit = await checkRateLimit("website-student-enquiry", ip);
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

    const loanAmountText = data.loanAmount?.trim() || undefined;
    const currentStatus = data.currentStatus?.trim() || undefined;
    const preferredLender = data.preferredLender?.trim() || undefined;
    const contactSubject = data.subject?.trim() || undefined;
    const parsedLoanAmount = parseWebsiteLoanAmount(loanAmountText);

    if (data.phone?.trim()) {
      const pendingLead = await findPendingWebsiteStudentLeadByPhone(data.phone);
      if (pendingLead) {
        const updated = await updatePendingWebsiteStudentLead(
          pendingLead._id.toString(),
          data,
          ip
        );
        if (!updated) {
          return { success: false, error: "Unable to submit your enquiry. Please try again." };
        }

        await logActivity({
          action: "site_lead.student_resubmitted",
          description: `Website student lead resubmitted for ${data.name} (${pendingLead.studentId})`,
          resourceType: "student",
          resourceId: pendingLead._id.toString(),
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
          loanAmount: loanAmountText,
          currentStatus,
          preferredLender,
          contactSubject,
          message: data.message,
          enquiryType: data.enquiryType,
          formPage: data.formPage,
          studentCode: pendingLead.studentId,
          leadId: pendingLead._id.toString(),
          resubmitted: true,
        });

        revalidatePath("/dashboard/site-leads");
        revalidatePath("/dashboard/overview");
        revalidateInsightCaches();

        return { success: true, data: { id: pendingLead._id.toString() } };
      }

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
      loanAmountText ? `Loan amount: ${loanAmountText}` : null,
      currentStatus ? `Current status: ${currentStatus}` : null,
      preferredLender ? `Preferred lender: ${preferredLender}` : null,
      contactSubject ? `Subject: ${contactSubject}` : null,
      data.message?.trim() ? `Message: ${data.message.trim()}` : null,
    ].filter(Boolean);

    const student = await Student.create({
      studentId,
      firstName: sanitizeText(firstName),
      // Student.lastName is required; "." is the hidden placeholder for single-word names.
      lastName: sanitizeText(lastName) || ".",
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
        loanAmountText,
        currentStatus,
        preferredLender,
        contactSubject,
      },
    });

    await Application.create({
      studentId: student._id,
      loanAmount: parsedLoanAmount,
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
      loanAmount: loanAmountText,
      currentStatus,
      preferredLender,
      contactSubject,
      message: data.message,
      enquiryType: data.enquiryType,
      formPage: data.formPage,
      studentCode: studentId,
      leadId: student._id.toString(),
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

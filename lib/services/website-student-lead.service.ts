import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { Application } from "@/models/Application";
import {
  SITE_LEAD_SOURCE,
  websitePendingStudentLeadsFilter,
} from "@/lib/constants/site-leads";
import { getStudentPhoneLookupValues } from "@/lib/services/student-phone.service";
import { parseWebsiteLoanAmount } from "@/lib/utils/website-loan-amount";
import { normalizeIndianPhone } from "@/lib/validations/indian-fields";
import { sanitizeText } from "@/lib/utils/sanitize";
import { splitFullName } from "@/lib/utils/person-name";
import type { websiteEnquirySchema } from "@/lib/validations/schemas";
import type { z } from "zod";

type WebsiteEnquiryData = z.infer<typeof websiteEnquirySchema>;

export async function findPendingWebsiteStudentLeadByPhone(phone: string) {
  const values = getStudentPhoneLookupValues(phone);
  if (!values.length) return null;

  await connectDB();

  return Student.findOne({
    ...websitePendingStudentLeadsFilter(),
    $or: [{ phone: { $in: values } }, { whatsapp: { $in: values } }],
  })
    .select("_id studentId firstName lastName metadata notes targetCountry email education")
    .lean();
}

function buildWebsiteEnquiryNoteLines(data: WebsiteEnquiryData) {
  const loanAmountText = data.loanAmount?.trim() || undefined;
  const currentStatus = data.currentStatus?.trim() || undefined;
  const preferredLender = data.preferredLender?.trim() || undefined;
  const contactSubject = data.subject?.trim() || undefined;

  return [
    `Enquiry type: ${data.enquiryType}`,
    data.formPage ? `Submitted from: ${data.formPage}` : null,
    data.loanRequired ? "Education loan required: Yes" : null,
    loanAmountText ? `Loan amount: ${loanAmountText}` : null,
    currentStatus ? `Current status: ${currentStatus}` : null,
    preferredLender ? `Preferred lender: ${preferredLender}` : null,
    contactSubject ? `Subject: ${contactSubject}` : null,
    data.message?.trim() ? `Message: ${data.message.trim()}` : null,
  ].filter(Boolean) as string[];
}

export async function updatePendingWebsiteStudentLead(
  leadId: string,
  data: WebsiteEnquiryData,
  ip?: string
) {
  await connectDB();

  const { firstName, lastName } = splitFullName(data.name);
  const loanAmountText = data.loanAmount?.trim() || undefined;
  const currentStatus = data.currentStatus?.trim() || undefined;
  const preferredLender = data.preferredLender?.trim() || undefined;
  const contactSubject = data.subject?.trim() || undefined;
  const parsedLoanAmount = parseWebsiteLoanAmount(loanAmountText);
  const noteLines = buildWebsiteEnquiryNoteLines(data);
  const resubmittedAt = new Date();

  const student = await Student.findById(leadId);
  if (!student) return null;

  student.firstName = sanitizeText(firstName);
  // Student.lastName is required; "." is the hidden placeholder for single-word names.
  student.lastName = sanitizeText(lastName) || ".";
  student.phone = normalizeIndianPhone(data.phone);
  if (data.email?.trim()) student.email = data.email.trim();
  if (data.targetCountry?.trim()) student.targetCountry = data.targetCountry.trim();
  if (data.course?.trim()) {
    student.education = { ...student.education, course: sanitizeText(data.course) };
  }
  if (data.loanRequired) {
    student.loan = { ...student.loan, requested: 1 };
  }

  student.notes = [
    ...(student.notes ?? []),
    {
      content: [`Resubmitted ${resubmittedAt.toISOString()}`, ...noteLines].join("\n"),
      createdByName: "Website",
      createdAt: resubmittedAt,
    },
  ];

  student.metadata = {
    ...student.metadata,
    leadSource: SITE_LEAD_SOURCE.WEBSITE,
    enquiryType: data.enquiryType,
    formPage: data.formPage,
    ip,
    loanAmountText: loanAmountText ?? student.metadata?.loanAmountText,
    currentStatus: currentStatus ?? student.metadata?.currentStatus,
    preferredLender: preferredLender ?? student.metadata?.preferredLender,
    contactSubject: contactSubject ?? student.metadata?.contactSubject,
    resubmittedAt,
    resubmissionCount: (student.metadata?.resubmissionCount ?? 0) + 1,
  };

  await student.save();

  if (parsedLoanAmount > 0) {
    await Application.findOneAndUpdate(
      { studentId: student._id },
      { $set: { loanAmount: parsedLoanAmount } }
    );
  }

  return student;
}

export { buildWebsiteEnquiryNoteLines };

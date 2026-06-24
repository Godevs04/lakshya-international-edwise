import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { Partner } from "@/models/Partner";
import { Application } from "@/models/Application";
import { User } from "@/models/User";
import { studentSchema } from "@/lib/validations/schemas";
import { sanitizeText } from "@/lib/utils/sanitize";
import {
  normalizeAadhaar,
  normalizeIndianPhone,
  normalizePan,
  normalizePincode,
} from "@/lib/validations/indian-fields";
import { encryptSensitiveField } from "@/lib/utils/pii";
import { allocateStudentId } from "@/lib/services/student-id.service";
import {
  resolveLenderIdBySlug,
  resolveLenderNameBySlug,
} from "@/lib/services/lender.service";
import { findLenderSlugByName } from "@/lib/constants/lenders";
import { applyApplicationStatus } from "@/lib/constants/application-status";
import { mapRowToStudentInput, parseImportDate } from "@/lib/utils/student-import-parse";
import { logActivity } from "@/lib/services/activity.service";
import { Types } from "mongoose";

export interface ImportRowError {
  row: number;
  message: string;
}

export interface ImportStudentsResult {
  imported: number;
  failed: number;
  errors: ImportRowError[];
}

interface ImportContext {
  userId?: string;
  userName?: string;
}

function formatImportSaveError(error: unknown): string {
  if (error && typeof error === "object" && "errors" in error) {
    const validationError = error as {
      errors?: Record<string, { message?: string }>;
    };
    const firstIssue = Object.values(validationError.errors ?? {})[0];
    if (firstIssue?.message?.includes("Cast to date failed")) {
      return "Invalid date of birth — use YYYY-MM-DD format";
    }
    if (firstIssue?.message) return firstIssue.message;
  }

  if (error instanceof Error) {
    if (error.message.includes("Cast to date failed")) {
      return "Invalid date of birth — use YYYY-MM-DD format";
    }
    if (error.message) return error.message;
  }

  return "Failed to save student record";
}

function toObjectId(value?: string): Types.ObjectId | undefined {
  if (!value || !Types.ObjectId.isValid(value)) return undefined;
  return new Types.ObjectId(value);
}

async function resolvePartnerId(companyName?: string): Promise<string | undefined> {
  if (!companyName?.trim()) return undefined;
  const partner = await Partner.findOne({
    companyName: new RegExp(`^${companyName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    status: "active",
  })
    .select("_id")
    .lean();
  return partner?._id.toString();
}

async function resolveAssigneeId(email?: string): Promise<string | undefined> {
  const trimmed = email?.trim().toLowerCase();
  if (!trimmed) return undefined;
  const user = await User.findOne({ email: trimmed, status: "active" }).select("_id").lean();
  return user?._id.toString();
}

async function resolveLenderObjectId(lenderValue?: string): Promise<Types.ObjectId | undefined> {
  if (!lenderValue?.trim()) return undefined;
  const slug = findLenderSlugByName(lenderValue) ?? lenderValue.trim().toLowerCase();
  return resolveLenderIdBySlug(slug);
}

export async function importStudentsFromRows(
  rows: Record<string, string>[],
  context: ImportContext
): Promise<ImportStudentsResult> {
  await connectDB();

  const result: ImportStudentsResult = { imported: 0, failed: 0, errors: [] };
  const partnerCache = new Map<string, string | undefined>();
  const assigneeCache = new Map<string, string | undefined>();

  for (let index = 0; index < rows.length; index++) {
    const rowNumber = index + 2;
    const rawRow = rows[index];

    if (!rawRow.firstName?.trim() || !rawRow.lastName?.trim()) {
      result.failed++;
      result.errors.push({ row: rowNumber, message: "First name and last name are required" });
      continue;
    }

    let partnerId: string | undefined = rawRow.partnerId;
    if (!partnerId && rawRow.partnerCompanyName?.trim()) {
      const cacheKey = rawRow.partnerCompanyName.trim().toLowerCase();
      if (!partnerCache.has(cacheKey)) {
        partnerCache.set(cacheKey, await resolvePartnerId(rawRow.partnerCompanyName));
      }
      partnerId = partnerCache.get(cacheKey);
      if (!partnerId) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          message: `Partner not found: ${rawRow.partnerCompanyName}`,
        });
        continue;
      }
    }

    let assignedToId: string | undefined = rawRow.assignedToId;
    if (!assignedToId && rawRow.assigneeEmail?.trim()) {
      const cacheKey = rawRow.assigneeEmail.trim().toLowerCase();
      if (!assigneeCache.has(cacheKey)) {
        assigneeCache.set(cacheKey, await resolveAssigneeId(rawRow.assigneeEmail));
      }
      assignedToId = assigneeCache.get(cacheKey);
      if (!assignedToId) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          message: `Assignee not found: ${rawRow.assigneeEmail}`,
        });
        continue;
      }
    }

    const input = mapRowToStudentInput({ ...rawRow, partnerId, assignedToId });
    const parsed = studentSchema.safeParse(input);
    if (!parsed.success) {
      result.failed++;
      result.errors.push({
        row: rowNumber,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      });
      continue;
    }

    const data = parsed.data;
    const studentId = await allocateStudentId();
    const lenderSlug =
      findLenderSlugByName(data.lenderId) ?? data.lenderId?.trim().toLowerCase();
    const lenderObjectId = lenderSlug ? await resolveLenderObjectId(lenderSlug) : undefined;
    const lenderName = lenderSlug ? await resolveLenderNameBySlug(lenderSlug) : undefined;
    const appFields = applyApplicationStatus(data.applicationStatus ?? "docs_pending");
    const lifecycleStatus = data.status ?? appFields.status;

    try {
      const student = await Student.create({
        studentId,
        firstName: sanitizeText(data.firstName),
        lastName: sanitizeText(data.lastName),
        gender: data.gender,
        dob: parseImportDate(data.dob),
        phone: data.phone?.trim() ? normalizeIndianPhone(data.phone) : undefined,
        whatsapp: data.whatsapp?.trim() ? normalizeIndianPhone(data.whatsapp) : undefined,
        email: data.email,
        address: {
          line: data.addressLine ? sanitizeText(data.addressLine) : undefined,
          city: data.city,
          state: data.state,
          pincode: data.pincode?.trim() ? normalizePincode(data.pincode) : undefined,
        },
        aadhaar: data.aadhaar?.trim()
          ? encryptSensitiveField(normalizeAadhaar(data.aadhaar))
          : undefined,
        pan: data.pan?.trim() ? encryptSensitiveField(normalizePan(data.pan)) : undefined,
        education: {
          college: data.college,
          course: data.course,
          year: data.year,
        },
        targetCountry: data.targetCountry,
        targetIntake: data.targetIntake,
        targetDegree: data.targetDegree,
        targetUniversity: data.targetUniversity,
        admissionRevenue: data.admissionRevenue ?? 0,
        applicationStatus: appFields.applicationStatus,
        loggedIn: appFields.loggedIn,
        loan: {
          requested: data.loanRequested ?? 0,
          sanctioned: data.loanSanctioned ?? 0,
          disbursed: data.loanDisbursed ?? 0,
          interest: data.interest ?? 0,
          processingFee: data.processingFee ?? 0,
          pfPaid: appFields.pfPaid,
          currency: data.loanCurrency ?? "INR",
          lenderId: lenderObjectId,
          bankName: lenderName ?? data.bankName,
          applicationNumber: data.applicationNumber,
        },
        partnerId: data.partnerId || undefined,
        assignedTo: toObjectId(assignedToId),
        assignedAt: assignedToId ? new Date() : undefined,
        status: lifecycleStatus,
        remarks: data.remarks ? sanitizeText(data.remarks) : undefined,
        timeline: [
          {
            status: lifecycleStatus,
            note: "Imported via bulk upload",
            createdByName: context.userName,
            createdAt: new Date(),
          },
        ],
        metadata: {
          createdBy: toObjectId(context.userId),
          createdByName: context.userName,
        },
      });

      await Application.create({
        studentId: student._id,
        partnerId: data.partnerId || undefined,
        loanAmount: data.loanRequested ?? 0,
        status: lifecycleStatus,
        pipelineStage: lifecycleStatus,
        metadata: {
          createdBy: toObjectId(context.userId),
          createdByName: context.userName,
        },
      });

      if (data.partnerId) {
        await Partner.findByIdAndUpdate(data.partnerId, {
          $inc: { studentsCount: 1, totalLoanValue: data.loanRequested ?? 0 },
        });
      }

      result.imported++;
    } catch (error) {
      result.failed++;
      result.errors.push({ row: rowNumber, message: formatImportSaveError(error) });
    }
  }

  if (result.imported > 0) {
    await logActivity({
      action: "students.imported",
      description: `Bulk import completed: ${result.imported} students imported, ${result.failed} failed`,
      resourceType: "student",
      userId: context.userId,
      userName: context.userName,
      metadata: { imported: result.imported, failed: result.failed },
    });
  }

  return result;
}

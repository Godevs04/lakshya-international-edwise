import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { Partner } from "@/models/Partner";
import { Application } from "@/models/Application";
import { studentSchema } from "@/lib/validations/schemas";
import { sanitizeText } from "@/lib/utils/sanitize";
import {
  normalizeAadhaar,
  normalizeIndianPhone,
  normalizePan,
  normalizePincode,
} from "@/lib/validations/indian-fields";
import { encryptSensitiveField } from "@/lib/utils/pii";
import { generateStudentId } from "@/lib/utils/format";
import { mapRowToStudentInput } from "@/lib/utils/student-import-parse";
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

export async function importStudentsFromRows(
  rows: Record<string, string>[],
  context: ImportContext
): Promise<ImportStudentsResult> {
  await connectDB();

  const result: ImportStudentsResult = { imported: 0, failed: 0, errors: [] };
  const partnerCache = new Map<string, string | undefined>();

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

    const input = mapRowToStudentInput({ ...rawRow, partnerId });
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
    const studentId = generateStudentId();

    try {
      const student = await Student.create({
        studentId,
        firstName: sanitizeText(data.firstName),
        lastName: sanitizeText(data.lastName),
        gender: data.gender,
        dob: data.dob ? new Date(data.dob) : undefined,
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
        loan: {
          requested: data.loanRequested ?? 0,
          sanctioned: data.loanSanctioned ?? 0,
          disbursed: data.loanDisbursed ?? 0,
          interest: data.interest ?? 0,
          bankName: data.bankName,
          applicationNumber: data.applicationNumber,
        },
        partnerId: data.partnerId || undefined,
        status: data.status ?? "new",
        remarks: data.remarks ? sanitizeText(data.remarks) : undefined,
        timeline: [
          {
            status: data.status ?? "new",
            note: "Imported via bulk upload",
            createdByName: context.userName,
            createdAt: new Date(),
          },
        ],
        metadata: {
          createdBy: context.userId ? new Types.ObjectId(context.userId) : undefined,
          createdByName: context.userName,
        },
      });

      await Application.create({
        studentId: student._id,
        partnerId: data.partnerId || undefined,
        loanAmount: data.loanRequested ?? 0,
        status: data.status ?? "new",
        pipelineStage: data.status ?? "new",
        metadata: {
          createdBy: context.userId ? new Types.ObjectId(context.userId) : undefined,
          createdByName: context.userName,
        },
      });

      if (data.partnerId) {
        await Partner.findByIdAndUpdate(data.partnerId, {
          $inc: { studentsCount: 1, totalLoanValue: data.loanRequested ?? 0 },
        });
      }

      result.imported++;
    } catch {
      result.failed++;
      result.errors.push({ row: rowNumber, message: "Failed to save student record" });
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

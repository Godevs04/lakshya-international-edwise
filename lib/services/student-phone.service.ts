import { Types } from "mongoose";
import { Student } from "@/models/Student";
import { isValidIndianPhone, normalizeIndianPhone } from "@/lib/validations/indian-fields";
import {
  isAdmissionLead,
  STUDENT_RECORD_TYPE,
  type StudentRecordType,
} from "@/lib/constants/student-record-type";
import { SITE_LEAD_SOURCE } from "@/lib/constants/site-leads";

export interface StudentPhoneMatch {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  recordType?: StudentRecordType | string | null;
  leadSource?: string | null;
}

export function getStudentPhoneLookupValues(phone: string): string[] {
  const normalized = normalizeIndianPhone(phone.trim());
  if (!isValidIndianPhone(normalized)) {
    return [];
  }
  return [normalized, `91${normalized}`];
}

export async function findStudentWithPhone(
  phone: string,
  excludeStudentId?: string
): Promise<StudentPhoneMatch | null> {
  const values = getStudentPhoneLookupValues(phone);
  if (!values.length) {
    return null;
  }

  const filter: Record<string, unknown> = {
    $or: [{ phone: { $in: values } }, { whatsapp: { $in: values } }],
  };

  if (excludeStudentId && Types.ObjectId.isValid(excludeStudentId)) {
    filter._id = { $ne: new Types.ObjectId(excludeStudentId) };
  }

  const existing = await Student.findOne(filter)
    .select("_id studentId firstName lastName recordType metadata.leadSource")
    .lean();

  if (!existing) {
    return null;
  }

  return {
    id: existing._id.toString(),
    studentId: existing.studentId,
    firstName: existing.firstName,
    lastName: existing.lastName,
    recordType: existing.recordType ?? STUDENT_RECORD_TYPE.STUDENT,
    leadSource: existing.metadata?.leadSource ?? null,
  };
}

/** Detail URL for a phone match — students vs admission leads vs website inbox. */
export function getStudentPhoneMatchHref(match: StudentPhoneMatch): string {
  if (isAdmissionLead(match.recordType)) {
    if (match.leadSource === SITE_LEAD_SOURCE.WEBSITE) {
      return "/dashboard/site-leads?tab=students";
    }
    return `/dashboard/admissions/${match.id}`;
  }
  return `/dashboard/students/${match.id}`;
}

export function getStudentPhoneBatchKey(phone: string): string | null {
  const normalized = normalizeIndianPhone(phone.trim());
  return isValidIndianPhone(normalized) ? normalized : null;
}

export function formatDuplicateImportBatchPhoneError(firstRow: number): string {
  return `Duplicate phone number in import file (already used on row ${firstRow})`;
}

export function formatDuplicateStudentPhoneError(match: StudentPhoneMatch): string {
  const name = `${match.firstName} ${match.lastName}`.trim();
  const kind = isAdmissionLead(match.recordType) ? "admission lead" : "student";
  return `This phone number is already registered to ${kind} ${name} (${match.studentId})`;
}

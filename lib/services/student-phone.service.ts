import { Types } from "mongoose";
import { Student } from "@/models/Student";
import { isValidIndianPhone, normalizeIndianPhone } from "@/lib/validations/indian-fields";

export interface StudentPhoneMatch {
  studentId: string;
  firstName: string;
  lastName: string;
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

  if (excludeStudentId) {
    filter._id = { $ne: new Types.ObjectId(excludeStudentId) };
  }

  const existing = await Student.findOne(filter)
    .select("studentId firstName lastName")
    .lean();

  if (!existing) {
    return null;
  }

  return {
    studentId: existing.studentId,
    firstName: existing.firstName,
    lastName: existing.lastName,
  };
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
  return `This phone number is already registered to ${name} (${match.studentId})`;
}

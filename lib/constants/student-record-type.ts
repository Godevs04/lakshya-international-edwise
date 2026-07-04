export const STUDENT_RECORD_TYPE = {
  STUDENT: "student",
  ADMISSION: "lead",
} as const;

export type StudentRecordType =
  (typeof STUDENT_RECORD_TYPE)[keyof typeof STUDENT_RECORD_TYPE];

/** Mongo filter for full student profiles (excludes admission leads). */
export function excludeAdmissionLeadsFilter() {
  return { recordType: { $ne: STUDENT_RECORD_TYPE.ADMISSION } };
}

/** Mongo filter for admission-only records. */
export function admissionLeadsFilter() {
  return { recordType: STUDENT_RECORD_TYPE.ADMISSION };
}

export function isAdmissionLead(recordType?: string | null): boolean {
  return recordType === STUDENT_RECORD_TYPE.ADMISSION;
}

export { websitePendingStudentLeadsFilter, manualAdmissionLeadsFilter } from "@/lib/constants/site-leads";

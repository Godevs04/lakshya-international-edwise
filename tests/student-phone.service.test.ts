import { describe, expect, it } from "vitest";
import {
  formatDuplicateImportBatchPhoneError,
  formatDuplicateStudentPhoneError,
  getStudentPhoneBatchKey,
  getStudentPhoneLookupValues,
  getStudentPhoneMatchHref,
} from "@/lib/services/student-phone.service";
import { STUDENT_RECORD_TYPE } from "@/lib/constants/student-record-type";
import { SITE_LEAD_SOURCE } from "@/lib/constants/site-leads";

describe("student-phone.service", () => {
  it("normalizes phone lookup values to 10-digit and 91-prefixed forms", () => {
    expect(getStudentPhoneLookupValues("+91 98765 43210")).toEqual([
      "9876543210",
      "919876543210",
    ]);
  });

  it("returns empty lookup values for invalid phones", () => {
    expect(getStudentPhoneLookupValues("123")).toEqual([]);
    expect(getStudentPhoneLookupValues("")).toEqual([]);
  });

  it("formats duplicate phone error with student id and name", () => {
    expect(
      formatDuplicateStudentPhoneError({
        id: "507f1f77bcf86cd799439011",
        studentId: "STU-0042",
        firstName: "Ravi",
        lastName: "Kumar",
        recordType: STUDENT_RECORD_TYPE.STUDENT,
      })
    ).toBe("This phone number is already registered to student Ravi Kumar (STU-0042)");
  });

  it("formats duplicate phone error for admission leads", () => {
    expect(
      formatDuplicateStudentPhoneError({
        id: "507f1f77bcf86cd799439011",
        studentId: "STU-0042",
        firstName: "Ravi",
        lastName: "Kumar",
        recordType: STUDENT_RECORD_TYPE.ADMISSION,
      })
    ).toBe(
      "This phone number is already registered to admission lead Ravi Kumar (STU-0042)"
    );
  });

  it("builds detail hrefs for students, admissions, and website leads", () => {
    expect(
      getStudentPhoneMatchHref({
        id: "abc",
        studentId: "STU-1",
        firstName: "A",
        lastName: "B",
        recordType: STUDENT_RECORD_TYPE.STUDENT,
      })
    ).toBe("/dashboard/students/abc");

    expect(
      getStudentPhoneMatchHref({
        id: "abc",
        studentId: "STU-1",
        firstName: "A",
        lastName: "B",
        recordType: STUDENT_RECORD_TYPE.ADMISSION,
      })
    ).toBe("/dashboard/admissions/abc");

    expect(
      getStudentPhoneMatchHref({
        id: "abc",
        studentId: "STU-1",
        firstName: "A",
        lastName: "B",
        recordType: STUDENT_RECORD_TYPE.ADMISSION,
        leadSource: SITE_LEAD_SOURCE.WEBSITE,
      })
    ).toBe("/dashboard/site-leads?tab=students");
  });

  it("builds batch keys for duplicate detection within imports", () => {
    expect(getStudentPhoneBatchKey("+91 98765 43210")).toBe("9876543210");
    expect(getStudentPhoneBatchKey("invalid")).toBeNull();
  });

  it("formats within-file duplicate phone errors", () => {
    expect(formatDuplicateImportBatchPhoneError(3)).toBe(
      "Duplicate phone number in import file (already used on row 3)"
    );
  });
});

import { describe, expect, it } from "vitest";
import {
  formatDuplicateImportBatchPhoneError,
  formatDuplicateStudentPhoneError,
  getStudentPhoneBatchKey,
  getStudentPhoneLookupValues,
} from "@/lib/services/student-phone.service";

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
        studentId: "STU-0042",
        firstName: "Ravi",
        lastName: "Kumar",
      })
    ).toBe("This phone number is already registered to Ravi Kumar (STU-0042)");
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

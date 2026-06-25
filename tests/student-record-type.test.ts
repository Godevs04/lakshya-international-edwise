import { describe, expect, it } from "vitest";
import {
  STUDENT_RECORD_TYPE,
  admissionLeadsFilter,
  excludeAdmissionLeadsFilter,
  isAdmissionLead,
} from "@/lib/constants/student-record-type";

describe("student-record-type", () => {
  it("filters admission leads separately from students", () => {
    expect(admissionLeadsFilter()).toEqual({ recordType: "lead" });
    expect(excludeAdmissionLeadsFilter()).toEqual({ recordType: { $ne: "lead" } });
  });

  it("detects admission leads", () => {
    expect(isAdmissionLead(STUDENT_RECORD_TYPE.ADMISSION)).toBe(true);
    expect(isAdmissionLead(STUDENT_RECORD_TYPE.STUDENT)).toBe(false);
    expect(isAdmissionLead(undefined)).toBe(false);
  });
});

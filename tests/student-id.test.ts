import { afterEach, describe, expect, it } from "vitest";
import {
  buildStudentIdPrefix,
  formatStudentId,
  parseStudentIdSequence,
} from "@/lib/services/student-id.service";

describe("student-id.service", () => {
  const originalCode = process.env.APP_STUDENT_ID_CODE;

  afterEach(() => {
    if (originalCode === undefined) {
      delete process.env.APP_STUDENT_ID_CODE;
    } else {
      process.env.APP_STUDENT_ID_CODE = originalCode;
    }
  });

  it("uses STU-LIE format by default", () => {
    delete process.env.APP_STUDENT_ID_CODE;
    expect(buildStudentIdPrefix()).toBe("STU-LIE-");
    expect(formatStudentId(1)).toBe("STU-LIE-000001");
    expect(formatStudentId(42)).toBe("STU-LIE-000042");
  });

  it("parses branded and legacy ids", () => {
    expect(parseStudentIdSequence("STU-LIE-000003")).toBe(3);
    expect(parseStudentIdSequence("STU-000004")).toBe(4);
    expect(parseStudentIdSequence("STU-20240621-2358")).toBeNull();
  });

  it("supports a custom company code from env", () => {
    process.env.APP_STUDENT_ID_CODE = "acme";
    expect(buildStudentIdPrefix()).toBe("STU-ACME-");
    expect(formatStudentId(7)).toBe("STU-ACME-000007");
  });
});

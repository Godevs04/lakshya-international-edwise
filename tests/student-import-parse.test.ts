import { describe, expect, it } from "vitest";
import {
  buildImportTemplateCsv,
  mapRowToStudentInput,
  parseImportFile,
} from "@/lib/utils/student-import-parse";

describe("student-import-parse", () => {
  it("builds a CSV template with headers and sample row", () => {
    const csv = buildImportTemplateCsv();
    expect(csv).toContain("firstName,lastName");
    expect(csv.split("\n")).toHaveLength(2);
  });

  it("parses CSV rows and normalizes headers", () => {
    const csv = "First Name,Last Name,Phone,Status\nJane,Doe,9876543210,new\n";
    const buffer = new TextEncoder().encode(csv).buffer;
    const rows = parseImportFile(buffer, "students.csv");

    expect(rows).toHaveLength(1);
    expect(rows[0]?.firstName).toBe("Jane");
    expect(rows[0]?.lastName).toBe("Doe");
    expect(rows[0]?.phone).toBe("9876543210");
    expect(rows[0]?.status).toBe("new");
  });

  it("maps parsed row to student schema input", () => {
    const input = mapRowToStudentInput({
      firstName: "Arun",
      lastName: "Sharma",
      phone: "9876543210",
      loanRequested: "250000",
      status: "contacted",
    });

    expect(input.firstName).toBe("Arun");
    expect(input.lastName).toBe("Sharma");
    expect(input.loanRequested).toBe(250000);
    expect(input.status).toBe("contacted");
  });
});

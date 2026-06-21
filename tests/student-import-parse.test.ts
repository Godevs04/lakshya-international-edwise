import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import {
  buildImportTemplateCsv,
  buildImportTemplateXlsx,
  STUDENT_IMPORT_SAMPLE_ROWS,
} from "@/lib/utils/student-import-template";
import {
  mapRowToStudentInput,
  normalizeImportDate,
  parseImportFile,
} from "@/lib/utils/student-import-parse";

function toArrayBuffer(data: Buffer | Uint8Array): ArrayBuffer {
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

function encodeCsv(csv: string): ArrayBuffer {
  return toArrayBuffer(new TextEncoder().encode(csv));
}

describe("student-import-template", () => {
  it("builds a CSV template with readable headers and five sample rows", () => {
    const csv = buildImportTemplateCsv();
    expect(csv).toContain("First Name *,Last Name *");
    expect(csv.split("\n")).toHaveLength(STUDENT_IMPORT_SAMPLE_ROWS.length + 1);
    expect(csv).toContain("Kavin");
    expect(csv).toContain("Dev");
  });

  it("builds an Excel template with data and instructions sheets", () => {
    const buffer = buildImportTemplateXlsx();
    expect(buffer.byteLength).toBeGreaterThan(0);

    const rows = parseImportFile(toArrayBuffer(buffer), "student-import-template.xlsx");
    expect(rows).toHaveLength(STUDENT_IMPORT_SAMPLE_ROWS.length);
    expect(rows[0]?.firstName).toBe("Kavin");
    expect(rows[4]?.lastName).toBe("Malhotra");
  });
});

describe("student-import-parse", () => {
  it("parses CSV rows and normalizes headers", () => {
    const csv = "First Name,Last Name,Phone Number,Status\nJane,Doe,9876543210,new\n";
    const buffer = encodeCsv(csv);
    const rows = parseImportFile(buffer, "students.csv");

    expect(rows).toHaveLength(1);
    expect(rows[0]?.firstName).toBe("Jane");
    expect(rows[0]?.lastName).toBe("Doe");
    expect(rows[0]?.phone).toBe("9876543210");
    expect(rows[0]?.status).toBe("new");
  });

  it("parses template-style headers with required markers", () => {
    const csv = "First Name *,Last Name *,Interest Rate (%)\nArun,Sharma,8.5\n";
    const buffer = encodeCsv(csv);
    const rows = parseImportFile(buffer, "students.csv");

    expect(rows[0]?.firstName).toBe("Arun");
    expect(rows[0]?.interest).toBe("8.5");
  });

  it("parses CSV dates from the sample template file", () => {
    const filePath = path.join(process.cwd(), "Banners/test/student-import-template.csv");
    const fileBuffer = fs.readFileSync(filePath);
    const buffer = toArrayBuffer(fileBuffer);
    const rows = parseImportFile(buffer, "student-import-template.csv");

    expect(rows).toHaveLength(STUDENT_IMPORT_SAMPLE_ROWS.length);
    expect(rows[0]?.dob).toBe("2000-05-18");
    expect(rows[0]?.phone).toBe("9898989898");
    expect(rows[0]?.aadhaar).toBe("678901234567");
  });

  it("normalizes excel serial and ISO date strings", () => {
    expect(normalizeImportDate("36962")).toBe("2001-03-12");
    expect(normalizeImportDate("2001-03-12")).toBe("2001-03-12");
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

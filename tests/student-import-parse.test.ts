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
  resolveImportApplicationStatus,
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
    expect(csv).toContain("Application Status");
    expect(csv).toContain("Lender");
    expect(csv).toContain("Target Country");
    expect(csv.split("\n")).toHaveLength(STUDENT_IMPORT_SAMPLE_ROWS.length + 1);
    expect(csv).toContain("Priya");
    expect(csv).toContain("Auxilo");
  });

  it("builds an Excel template with data and instructions sheets", () => {
    const buffer = buildImportTemplateXlsx();
    expect(buffer.byteLength).toBeGreaterThan(0);

    const rows = parseImportFile(toArrayBuffer(buffer), "student-import-template.xlsx");
    expect(rows).toHaveLength(STUDENT_IMPORT_SAMPLE_ROWS.length);
    expect(rows[0]?.firstName).toBe("Priya");
    expect(rows[0]?.applicationStatus).toBe("docs_pending");
    expect(rows[0]?.lender).toBe("Auxilo");
    expect(rows[4]?.applicationStatus).toBe("pf_paid");
  });
});

describe("student-import-parse", () => {
  it("parses bank lan header aliases", () => {
    const csv = "First Name,Last Name,Bank LAN\nJane,Doe,HDFC-LAN-2026-001\n";
    const rows = parseImportFile(encodeCsv(csv), "students.csv");
    expect(rows[0]?.applicationNumber).toBe("HDFC-LAN-2026-001");
  });

  it("parses lender and application status columns", () => {
    const csv =
      "First Name,Last Name,Lender,Application Status,Target Country\nJane,Doe,Credila,loggedin,Canada\n";
    const rows = parseImportFile(encodeCsv(csv), "students.csv");
    expect(rows[0]?.lender).toBe("Credila");
    expect(rows[0]?.applicationStatus).toBe("loggedin");
    expect(rows[0]?.targetCountry).toBe("Canada");
  });

  it("maps legacy bank name column to lender", () => {
    const csv = "First Name,Last Name,Bank Name\nJane,Doe,Avanse\n";
    const rows = parseImportFile(encodeCsv(csv), "students.csv");
    expect(rows[0]?.lender).toBe("Avanse");
  });

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

  it("parses CSV dates from the generated template file", () => {
    const csv = buildImportTemplateCsv();
    const rows = parseImportFile(encodeCsv(csv), "student-import-template.csv");

    expect(rows).toHaveLength(STUDENT_IMPORT_SAMPLE_ROWS.length);
    expect(rows[0]?.dob).toBe("2001-03-12");
    expect(rows[0]?.phone).toBe("9876543210");
    expect(rows[0]?.aadhaar).toBe("234567891234");
    expect(rows[0]?.targetUniversity).toBe("University of British Columbia");
  });

  it("keeps compatibility with the checked-in sample CSV when present", () => {
    const filePath = path.join(process.cwd(), "assets/banners/test/student-import-template.csv");
    if (!fs.existsSync(filePath)) return;

    const fileBuffer = fs.readFileSync(filePath);
    const rows = parseImportFile(toArrayBuffer(fileBuffer), "student-import-template.csv");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]?.firstName).toBeTruthy();
  });

  it("normalizes excel serial and ISO date strings", () => {
    expect(normalizeImportDate("36962")).toBe("2001-03-12");
    expect(normalizeImportDate("2001-03-12")).toBe("2001-03-12");
  });

  it("resolves application status from new and legacy columns", () => {
    expect(resolveImportApplicationStatus({ applicationStatus: "pf_paid" })).toBe("pf_paid");
    expect(resolveImportApplicationStatus({ applicationStatus: "not_interested" })).toBe("not_interested");
    expect(resolveImportApplicationStatus({ applicationStatus: "need_callback" })).toBe("need_callback");
    expect(resolveImportApplicationStatus({ applicationStatus: "Need Call Back" })).toBe("need_callback");
    expect(resolveImportApplicationStatus({ applicationStatus: "future_intake" })).toBe("future_intake");
    expect(resolveImportApplicationStatus({ status: "disbursed" })).toBe("disbursed");
    expect(resolveImportApplicationStatus({ status: "documents_pending" })).toBe("docs_pending");
    expect(resolveImportApplicationStatus({})).toBe("docs_pending");
  });

  it("maps parsed row to student schema input", () => {
    const input = mapRowToStudentInput({
      firstName: "Arun",
      lastName: "Sharma",
      phone: "9876543210",
      partnerId: "507f1f77bcf86cd799439011",
      targetCountry: "United Kingdom",
      targetIntake: "Fall 2026 (Aug - Sep)",
      loanRequested: "250000",
      lender: "Credila",
      applicationStatus: "sanctioned",
      loanCurrency: "INR",
      processingFee: "10000",
    });

    expect(input.firstName).toBe("Arun");
    expect(input.lastName).toBe("Sharma");
    expect(input.loanRequested).toBe(250000);
    expect(input.lenderId).toBe("Credila");
    expect(input.applicationStatus).toBe("sanctioned");
    expect(input.targetCountry).toBe("United Kingdom");
    expect(input.loanCurrency).toBe("INR");
    expect(input.processingFee).toBe(10000);
  });

  it("maps disbursement type from import row", () => {
    const input = mapRowToStudentInput({
      firstName: "Arun",
      lastName: "Sharma",
      phone: "9876543210",
      partnerId: "507f1f77bcf86cd799439011",
      targetCountry: "United Kingdom",
      targetIntake: "Fall 2026 (Aug - Sep)",
      disbursementType: "tranche",
    });

    expect(input.disbursementType).toBe("tranche");
  });
});

import * as XLSX from "xlsx";
import type { StudentInput } from "@/lib/validations/schemas";

export const IMPORT_TEMPLATE_HEADERS = [
  "firstName",
  "lastName",
  "phone",
  "whatsapp",
  "email",
  "gender",
  "dob",
  "addressLine",
  "city",
  "state",
  "pincode",
  "aadhaar",
  "pan",
  "college",
  "course",
  "year",
  "loanRequested",
  "loanSanctioned",
  "loanDisbursed",
  "interest",
  "bankName",
  "applicationNumber",
  "partnerCompanyName",
  "status",
  "remarks",
] as const;

const HEADER_ALIASES: Record<string, string> = {
  firstname: "firstName",
  "first name": "firstName",
  lastname: "lastName",
  "last name": "lastName",
  address: "addressLine",
  addressline: "addressLine",
  "address line": "addressLine",
  loanrequested: "loanRequested",
  "loan requested": "loanRequested",
  loansanctioned: "loanSanctioned",
  "loan sanctioned": "loanSanctioned",
  loandisbursed: "loanDisbursed",
  "loan disbursed": "loanDisbursed",
  bankname: "bankName",
  "bank name": "bankName",
  applicationnumber: "applicationNumber",
  "application number": "applicationNumber",
  partnercompanyname: "partnerCompanyName",
  "partner company name": "partnerCompanyName",
  partner: "partnerCompanyName",
  phone: "phone",
  whatsapp: "whatsapp",
  email: "email",
  gender: "gender",
  dob: "dob",
  city: "city",
  state: "state",
  pincode: "pincode",
  college: "college",
  course: "course",
  year: "year",
  status: "status",
  remarks: "remarks",
};

function normalizeHeader(header: string): string {
  const trimmed = header.trim();
  const lower = trimmed.toLowerCase();
  if (IMPORT_TEMPLATE_HEADERS.includes(trimmed as (typeof IMPORT_TEMPLATE_HEADERS)[number])) {
    return trimmed;
  }
  return HEADER_ALIASES[lower] ?? trimmed;
}

function cellValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

export function buildImportTemplateCsv(): string {
  const sample = [
    "Ravi",
    "Kumar",
    "9876543210",
    "",
    "ravi@example.com",
    "male",
    "2000-01-15",
    "12 MG Road",
    "Chennai",
    "Tamil Nadu",
    "600001",
    "",
    "",
    "Anna University",
    "B.Tech",
    "3",
    "500000",
    "0",
    "0",
    "8.5",
    "SBI",
    "",
    "Partner Co Ltd",
    "new",
    "Imported via bulk upload",
  ];
  return [IMPORT_TEMPLATE_HEADERS.join(","), sample.join(",")].join("\n");
}

export function parseImportFile(
  buffer: ArrayBuffer,
  filename: string
): Record<string, string>[] {
  const lowerName = filename.toLowerCase();
  let rows: Record<string, unknown>[];

  if (lowerName.endsWith(".csv")) {
    const text = new TextDecoder().decode(buffer);
    const workbook = XLSX.read(text, { type: "string" });
    const sheet = workbook.Sheets[workbook.SheetNames[0] ?? ""];
    rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  } else {
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0] ?? ""];
    rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  }

  return rows
    .map((row) => {
      const normalized: Record<string, string> = {};
      for (const [key, value] of Object.entries(row)) {
        normalized[normalizeHeader(key)] = cellValue(value);
      }
      return normalized;
    })
    .filter((row) => Object.values(row).some((value) => value.length > 0));
}

export function mapRowToStudentInput(row: Record<string, string>): StudentInput {
  return {
    firstName: row.firstName ?? "",
    lastName: row.lastName ?? "",
    phone: row.phone || undefined,
    whatsapp: row.whatsapp || undefined,
    email: row.email || undefined,
    gender: (row.gender as StudentInput["gender"]) || undefined,
    dob: row.dob || undefined,
    addressLine: row.addressLine || undefined,
    city: row.city || undefined,
    state: row.state || undefined,
    pincode: row.pincode || undefined,
    aadhaar: row.aadhaar || undefined,
    pan: row.pan || undefined,
    college: row.college || undefined,
    course: row.course || undefined,
    year: row.year || undefined,
    loanRequested: row.loanRequested ? Number(row.loanRequested) : undefined,
    loanSanctioned: row.loanSanctioned ? Number(row.loanSanctioned) : undefined,
    loanDisbursed: row.loanDisbursed ? Number(row.loanDisbursed) : undefined,
    interest: row.interest ? Number(row.interest) : undefined,
    bankName: row.bankName || undefined,
    applicationNumber: row.applicationNumber || undefined,
    partnerId: row.partnerId || undefined,
    status: (row.status as StudentInput["status"]) || "new",
    remarks: row.remarks || undefined,
    photo: undefined,
  };
}

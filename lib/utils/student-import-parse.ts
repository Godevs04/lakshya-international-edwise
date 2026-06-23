import * as XLSX from "xlsx";
import type { StudentInput } from "@/lib/validations/schemas";
import {
  buildImportTemplateLabelAliases,
  STUDENT_IMPORT_COLUMN_KEYS,
} from "@/lib/utils/student-import-template";

export const IMPORT_TEMPLATE_HEADERS = STUDENT_IMPORT_COLUMN_KEYS;

const HEADER_ALIASES: Record<string, string> = {
  firstname: "firstName",
  "first name": "firstName",
  lastname: "lastName",
  "last name": "lastName",
  "phone number": "phone",
  "whatsapp number": "whatsapp",
  "email address": "email",
  "date of birth": "dob",
  address: "addressLine",
  addressline: "addressLine",
  "address line": "addressLine",
  "aadhaar number": "aadhaar",
  "pan number": "pan",
  "college / university": "college",
  "year of study": "year",
  loanrequested: "loanRequested",
  "loan requested": "loanRequested",
  "loan requested (inr)": "loanRequested",
  loansanctioned: "loanSanctioned",
  "loan sanctioned": "loanSanctioned",
  "loan sanctioned (inr)": "loanSanctioned",
  loandisbursed: "loanDisbursed",
  "loan disbursed": "loanDisbursed",
  "loan disbursed (inr)": "loanDisbursed",
  "interest rate (%)": "interest",
  bankname: "bankName",
  "bank name": "bankName",
  applicationnumber: "applicationNumber",
  "application number": "applicationNumber",
  "bank lan": "applicationNumber",
  lan: "applicationNumber",
  "loan application number": "applicationNumber",
  partnercompanyname: "partnerCompanyName",
  "partner company name": "partnerCompanyName",
  "partner company": "partnerCompanyName",
  partner: "partnerCompanyName",
  phone: "phone",
  whatsapp: "whatsapp",
  email: "email",
  gender: "gender",
  dob: "dob",
  city: "city",
  state: "state",
  pincode: "pincode",
  aadhaar: "aadhaar",
  pan: "pan",
  college: "college",
  course: "course",
  year: "year",
  status: "status",
  remarks: "remarks",
};

const TEMPLATE_LABEL_ALIASES = buildImportTemplateLabelAliases();

function normalizeHeader(header: string): string {
  const trimmed = header.trim().replace(/\s*\*+\s*$/, "");
  const lower = trimmed.toLowerCase();
  if (IMPORT_TEMPLATE_HEADERS.includes(trimmed as (typeof IMPORT_TEMPLATE_HEADERS)[number])) {
    return trimmed;
  }
  if (TEMPLATE_LABEL_ALIASES[lower]) {
    return TEMPLATE_LABEL_ALIASES[lower];
  }
  return HEADER_ALIASES[lower] ?? trimmed;
}

const DATE_FIELD_KEYS = new Set<string>(["dob"]);

function formatNumericCell(value: number): string {
  if (Number.isInteger(value) || Math.abs(value - Math.round(value)) < 1e-9) {
    return String(Math.round(value));
  }
  return String(value);
}

export function excelSerialToIsoDate(serial: number): string | undefined {
  if (!Number.isFinite(serial) || serial < 20000 || serial > 60000) return undefined;
  const utcDays = Math.floor(serial - 25569);
  const date = new Date(utcDays * 86400 * 1000);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
}

export function normalizeImportDate(value?: string): string | undefined {
  if (!value?.trim()) return undefined;

  const serial = Number(value);
  if (!Number.isNaN(serial)) {
    const fromSerial = excelSerialToIsoDate(serial);
    if (fromSerial) return fromSerial;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }

  return parsed.toISOString().slice(0, 10);
}

export function parseImportDate(value?: string): Date | undefined {
  const normalized = normalizeImportDate(value);
  if (!normalized) return undefined;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function cellValue(value: unknown, fieldKey?: string): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10);
  }
  if (typeof value === "number") {
    if (fieldKey && DATE_FIELD_KEYS.has(fieldKey)) {
      return excelSerialToIsoDate(value) ?? formatNumericCell(value);
    }
    return formatNumericCell(value);
  }

  const text = String(value).trim();
  if (fieldKey && DATE_FIELD_KEYS.has(fieldKey)) {
    return normalizeImportDate(text) ?? text;
  }
  return text;
}

function readImportWorkbook(buffer: ArrayBuffer, filename: string): XLSX.WorkBook {
  const lowerName = filename.toLowerCase();
  const readOptions: XLSX.ParsingOptions = { cellDates: true };

  if (lowerName.endsWith(".csv")) {
    const text = new TextDecoder().decode(buffer);
    return XLSX.read(text, { ...readOptions, type: "string" });
  }

  return XLSX.read(buffer, { ...readOptions, type: "array" });
}

export function parseImportFile(
  buffer: ArrayBuffer,
  filename: string
): Record<string, string>[] {
  const workbook = readImportWorkbook(buffer, filename);
  const sheet = workbook.Sheets[workbook.SheetNames[0] ?? ""];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  return rows
    .map((row) => {
      const normalized: Record<string, string> = {};
      for (const [key, value] of Object.entries(row)) {
        const fieldKey = normalizeHeader(key);
        normalized[fieldKey] = cellValue(value, fieldKey);
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
    dob: normalizeImportDate(row.dob),
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
    applicationStatus: "docs_pending",
    remarks: row.remarks || undefined,
    photo: undefined,
  };
}

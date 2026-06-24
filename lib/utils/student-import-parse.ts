import * as XLSX from "xlsx";
import type { StudentInput } from "@/lib/validations/schemas";
import {
  APPLICATION_STATUS_VALUES,
  type ApplicationStatusId,
} from "@/lib/constants/application-status";
import type { StudentStatus } from "@/lib/constants/statuses";
import {
  buildImportTemplateLabelAliases,
  STUDENT_IMPORT_COLUMN_KEYS,
} from "@/lib/utils/student-import-template";
import { roundMoney } from "@/lib/utils/format";

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
  "target country": "targetCountry",
  "target intake": "targetIntake",
  "target degree": "targetDegree",
  "target university": "targetUniversity",
  loancurrency: "loanCurrency",
  "loan currency": "loanCurrency",
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
  processingfee: "processingFee",
  "processing fee": "processingFee",
  "processing fee (inr)": "processingFee",
  lender: "lender",
  "lender name": "lender",
  bankname: "lender",
  "bank name": "lender",
  applicationnumber: "applicationNumber",
  "application number": "applicationNumber",
  "bank lan": "applicationNumber",
  lan: "applicationNumber",
  "loan application number": "applicationNumber",
  applicationstatus: "applicationStatus",
  "application status": "applicationStatus",
  partnercompanyname: "partnerCompanyName",
  "partner company name": "partnerCompanyName",
  "partner company": "partnerCompanyName",
  partner: "partnerCompanyName",
  assigneeemail: "assigneeEmail",
  "assignee email": "assigneeEmail",
  "assigned to email": "assigneeEmail",
  admissionrevenue: "admissionRevenue",
  "admission revenue": "admissionRevenue",
  "admission revenue (inr)": "admissionRevenue",
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

const LEGACY_STATUS_TO_APPLICATION: Partial<Record<StudentStatus, ApplicationStatusId>> = {
  documents_pending: "docs_pending",
  submitted: "loggedin",
  sanctioned: "sanctioned",
  disbursed: "disbursed",
  rejected: "rejected",
};

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

function normalizeApplicationStatus(value?: string): ApplicationStatusId | undefined {
  const trimmed = value?.trim().toLowerCase().replace(/\s+/g, "_");
  if (!trimmed) return undefined;
  if (APPLICATION_STATUS_VALUES.includes(trimmed as ApplicationStatusId)) {
    return trimmed as ApplicationStatusId;
  }
  if (trimmed === "logged_in") return "loggedin";
  if (trimmed === "docs_pending" || trimmed === "documents_pending") return "docs_pending";
  if (trimmed === "pf_paid") return "pf_paid";
  if (trimmed === "pf_pending") return "pf_pending";
  return undefined;
}

export function resolveImportApplicationStatus(
  row: Record<string, string>
): ApplicationStatusId {
  const fromColumn = normalizeApplicationStatus(row.applicationStatus);
  if (fromColumn) return fromColumn;

  const legacyStatus = row.status?.trim() as StudentStatus | undefined;
  if (legacyStatus && LEGACY_STATUS_TO_APPLICATION[legacyStatus]) {
    return LEGACY_STATUS_TO_APPLICATION[legacyStatus]!;
  }

  return "docs_pending";
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

function parseImportMoney(value?: string): number | undefined {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  return roundMoney(parsed);
}

export function mapRowToStudentInput(row: Record<string, string>): StudentInput {
  const lenderValue = row.lender || row.bankName || row.lenderId || undefined;
  const applicationStatus = resolveImportApplicationStatus(row);
  const loanCurrency = row.loanCurrency?.trim().toUpperCase();

  return {
    firstName: row.firstName ?? "",
    lastName: row.lastName ?? "",
    phone: row.phone || "",
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
    targetCountry: row.targetCountry || "",
    targetIntake: row.targetIntake || "",
    targetDegree: row.targetDegree || "",
    targetUniversity: row.targetUniversity || undefined,
    loanCurrency: loanCurrency === "USD" || loanCurrency === "INR" ? loanCurrency : undefined,
    loanRequested: parseImportMoney(row.loanRequested),
    loanSanctioned: parseImportMoney(row.loanSanctioned),
    loanDisbursed: parseImportMoney(row.loanDisbursed),
    interest: row.interest ? roundMoney(Number(row.interest)) : undefined,
    processingFee: parseImportMoney(row.processingFee),
    lenderId: lenderValue,
    bankName: row.bankName || undefined,
    applicationNumber: row.applicationNumber || undefined,
    applicationStatus,
    partnerId: row.partnerId || "",
    assignedToId: row.assignedToId || undefined,
    admissionRevenue: parseImportMoney(row.admissionRevenue),
    status: (row.status as StudentInput["status"]) || undefined,
    remarks: row.remarks || undefined,
    photo: undefined,
  };
}

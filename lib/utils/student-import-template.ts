import * as XLSX from "xlsx";
import { APPLICATION_STATUS_OPTIONS } from "@/lib/constants/application-status";
import { LENDER_SEEDS } from "@/lib/constants/lenders";
import { STUDENT_STATUSES } from "@/lib/constants/statuses";

export const STUDENT_IMPORT_COLUMN_KEYS = [
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
  "targetCountry",
  "targetIntake",
  "targetDegree",
  "targetUniversity",
  "loanCurrency",
  "loanRequested",
  "loanSanctioned",
  "loanDisbursed",
  "disbursementType",
  "interest",
  "processingFee",
  "lender",
  "applicationNumber",
  "applicationStatus",
  "partnerCompanyName",
  "assigneeEmail",
  "remarks",
] as const;

export type StudentImportColumnKey = (typeof STUDENT_IMPORT_COLUMN_KEYS)[number];

export interface StudentImportColumn {
  key: StudentImportColumnKey;
  label: string;
  required?: boolean;
  width?: number;
}

export const STUDENT_IMPORT_COLUMNS: StudentImportColumn[] = [
  { key: "firstName", label: "First Name", required: true, width: 14 },
  { key: "lastName", label: "Last Name", required: true, width: 14 },
  { key: "phone", label: "Phone Number", width: 14 },
  { key: "whatsapp", label: "WhatsApp Number", width: 16 },
  { key: "email", label: "Email Address", width: 26 },
  { key: "gender", label: "Gender", width: 10 },
  { key: "dob", label: "Date of Birth", width: 14 },
  { key: "addressLine", label: "Address Line", width: 28 },
  { key: "city", label: "City", width: 14 },
  { key: "state", label: "State", width: 16 },
  { key: "pincode", label: "Pincode", width: 10 },
  { key: "aadhaar", label: "Aadhaar Number", width: 16 },
  { key: "pan", label: "PAN Number", width: 14 },
  { key: "college", label: "College / University", width: 24 },
  { key: "course", label: "Course", width: 16 },
  { key: "year", label: "Year of Study", width: 12 },
  { key: "targetCountry", label: "Target Country", required: true, width: 18 },
  { key: "targetIntake", label: "Target Intake", required: true, width: 22 },
  { key: "targetDegree", label: "Target Degree", width: 16 },
  { key: "targetUniversity", label: "Target University", width: 26 },
  { key: "loanCurrency", label: "Loan Currency", width: 12 },
  { key: "loanRequested", label: "Loan Requested", width: 16 },
  { key: "loanSanctioned", label: "Loan Sanctioned", width: 16 },
  { key: "loanDisbursed", label: "Loan Disbursed", width: 16 },
  { key: "disbursementType", label: "Disbursement Type", width: 18 },
  { key: "interest", label: "Interest Rate (%)", width: 14 },
  { key: "processingFee", label: "Processing Fee (INR)", width: 18 },
  { key: "lender", label: "Lender", width: 18 },
  { key: "applicationNumber", label: "Bank LAN", width: 18 },
  { key: "applicationStatus", label: "Application Status", width: 18 },
  { key: "partnerCompanyName", label: "Consultancy (Partner)", required: true, width: 22 },
  { key: "assigneeEmail", label: "Assignee Email", width: 24 },
  { key: "remarks", label: "Remarks", width: 30 },
];

export const STUDENT_IMPORT_SAMPLE_ROWS: Record<StudentImportColumnKey, string>[] = [
  {
    firstName: "Priya",
    lastName: "Sharma",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "priya.sharma@sample.edwise.in",
    gender: "female",
    dob: "2001-03-12",
    addressLine: "42 Anna Salai, Teynampet",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600018",
    aadhaar: "234567891234",
    pan: "ABCDE1234F",
    college: "Loyola College",
    course: "B.Sc Computer Science",
    year: "3",
    targetCountry: "Canada",
    targetIntake: "Fall 2026 (Aug - Sep)",
    targetDegree: "Masters/MBA",
    targetUniversity: "University of British Columbia",
    loanCurrency: "INR",
    loanRequested: "850000",
    loanSanctioned: "0",
    loanDisbursed: "0",
    disbursementType: "",
    interest: "8.25",
    processingFee: "0",
    lender: "Auxilo",
    applicationNumber: "",
    applicationStatus: "docs_pending",
    partnerCompanyName: "Godevs",
    assigneeEmail: "",
    remarks: "Awaiting co-applicant KYC documents",
  },
  {
    firstName: "Rahul",
    lastName: "Menon",
    phone: "9123456789",
    whatsapp: "9123456789",
    email: "rahul.menon@sample.edwise.in",
    gender: "male",
    dob: "2000-07-25",
    addressLine: "18 MG Road, Ernakulam",
    city: "Kochi",
    state: "Kerala",
    pincode: "682016",
    aadhaar: "345678912345",
    pan: "FGHIJ5678K",
    college: "CUSAT",
    course: "B.Tech Mechanical Engineering",
    year: "4",
    targetCountry: "United States",
    targetIntake: "Spring 2027 (Jan - Mar)",
    targetDegree: "Masters/MBA",
    targetUniversity: "Northeastern University",
    loanCurrency: "INR",
    loanRequested: "1200000",
    loanSanctioned: "0",
    loanDisbursed: "0",
    disbursementType: "",
    interest: "7.9",
    processingFee: "10000",
    lender: "Credila",
    applicationNumber: "CRE-EDU-2026-3310",
    applicationStatus: "loggedin",
    partnerCompanyName: "Rooted",
    assigneeEmail: "",
    remarks: "Logged in with bank — sanction in progress",
  },
  {
    firstName: "Ananya",
    lastName: "Patel",
    phone: "9988776655",
    whatsapp: "9988776655",
    email: "ananya.patel@sample.edwise.in",
    gender: "female",
    dob: "1999-11-08",
    addressLine: "7 CG Road, Navrangpura",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380009",
    aadhaar: "456789123456",
    pan: "KLMNO9012P",
    college: "Nirma University",
    course: "MBA Finance",
    year: "2",
    targetCountry: "United Kingdom",
    targetIntake: "Fall 2026 (Aug - Sep)",
    targetDegree: "Masters/MBA",
    targetUniversity: "University of Manchester",
    loanCurrency: "INR",
    loanRequested: "980000",
    loanSanctioned: "950000",
    loanDisbursed: "0",
    disbursementType: "",
    interest: "7.55",
    processingFee: "14000",
    lender: "Avanse",
    applicationNumber: "AVN-EDU-2026-5521",
    applicationStatus: "sanctioned",
    partnerCompanyName: "Godevs",
    assigneeEmail: "",
    remarks: "Sanction letter received — PF collection pending",
  },
  {
    firstName: "Vikram",
    lastName: "Singh",
    phone: "9765432109",
    whatsapp: "9765432109",
    email: "vikram.singh@sample.edwise.in",
    gender: "male",
    dob: "1998-06-30",
    addressLine: "22 C-Scheme, MI Road",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302001",
    aadhaar: "567891234567",
    pan: "PQRST3456U",
    college: "MNIT Jaipur",
    course: "M.Tech Civil Engineering",
    year: "2",
    targetCountry: "Australia",
    targetIntake: "Summer 2026 (Apr - Jun)",
    targetDegree: "Masters/MBA",
    targetUniversity: "University of Melbourne",
    loanCurrency: "INR",
    loanRequested: "650000",
    loanSanctioned: "650000",
    loanDisbursed: "650000",
    disbursementType: "full",
    interest: "7.2",
    processingFee: "11000",
    lender: "Credila",
    applicationNumber: "HDFC-EDU-2026-8890",
    applicationStatus: "disbursed",
    partnerCompanyName: "Rooted",
    assigneeEmail: "",
    remarks: "Full disbursement completed to university account",
  },
  {
    firstName: "Neha",
    lastName: "Kapoor",
    phone: "9654321098",
    whatsapp: "9654321098",
    email: "neha.kapoor@sample.edwise.in",
    gender: "female",
    dob: "2002-01-15",
    addressLine: "5 Sector 17, Plaza",
    city: "Chandigarh",
    state: "Chandigarh",
    pincode: "160017",
    aadhaar: "678912345678",
    pan: "UVWXY7890Z",
    college: "PU Chandigarh",
    course: "BBA International Business",
    year: "3",
    targetCountry: "Ireland",
    targetIntake: "Winter 2026 (Oct - Dec)",
    targetDegree: "Bachelors",
    targetUniversity: "Trinity College Dublin",
    loanCurrency: "INR",
    loanRequested: "540000",
    loanSanctioned: "520000",
    loanDisbursed: "0",
    disbursementType: "",
    interest: "8.05",
    processingFee: "12500",
    lender: "InCred",
    applicationNumber: "INC-EDU-2026-4412",
    applicationStatus: "pf_paid",
    partnerCompanyName: "Godevs",
    assigneeEmail: "",
    remarks: "PF paid — ready for disbursement request",
  },
];

const APPLICATION_STATUS_GUIDE = APPLICATION_STATUS_OPTIONS.map(
  (option) => option.value
).join(", ");

const LENDER_GUIDE = `${LENDER_SEEDS.map((entry) => entry.name).join(", ")} (plus any banks added on the Lenders page)`;

const LEGACY_STATUS_GUIDE = STUDENT_STATUSES.join(", ");

const GUIDE_LINES = [
  ["Lakshya International Edwise"],
  ["Student Bulk Import Template"],
  [""],
  ["How to use"],
  ['1. Open the "Student Import" sheet (first tab).'],
  ["2. Replace the 5 sample rows with your student data, or add rows below them."],
  ["3. Keep the header row unchanged. Fields marked with * are required."],
  ["4. Save the file and upload it from Dashboard → Students → Import."],
  [""],
  ["Field notes"],
  ["• Gender: male, female, or other"],
  ["• Date of Birth: use YYYY-MM-DD (e.g. 2001-03-12)"],
  ["• Loan Currency: INR or USD"],
  ["• Loan amounts & fees: numbers only, without commas or currency symbols"],
  ["• Disbursement Type: full or tranche (when loan is disbursed)"],
  ["• Interest Rate: percentage between 0 and 100 (e.g. 7.8)"],
  [`• Lender: ${LENDER_GUIDE}`],
  ["• Bank LAN: loan application number from the bank after login"],
  [`• Application Status: ${APPLICATION_STATUS_GUIDE}`],
  ["• Partner Company: must match an existing active partner in the CRM"],
  ["• Assignee Email: optional — must match an active team member's login email"],
  [""],
  ["Legacy imports"],
  [`• Old "Status" column (${LEGACY_STATUS_GUIDE}) is still accepted and mapped to application status`],
  ['• Old "Bank Name" column is still accepted as an alias for Lender'],
  [""],
  ["Limits"],
  ["• Maximum 500 student rows per import"],
  ["• Supported formats: .xlsx, .xls, .csv"],
  [""],
  ["Need help? Contact your CRM administrator."],
];

function columnHeaderLabel(column: StudentImportColumn): string {
  return column.required ? `${column.label} *` : column.label;
}

function sampleRowValues(row: Record<StudentImportColumnKey, string>): string[] {
  return STUDENT_IMPORT_COLUMNS.map((column) => row[column.key] ?? "");
}

export function buildImportTemplateLabelAliases(): Record<string, StudentImportColumnKey> {
  const aliases: Record<string, StudentImportColumnKey> = {};
  for (const column of STUDENT_IMPORT_COLUMNS) {
    aliases[column.label.toLowerCase()] = column.key;
    aliases[`${column.label.toLowerCase()} *`] = column.key;
    aliases[column.key.toLowerCase()] = column.key;
  }
  return aliases;
}

export function buildImportTemplateCsv(): string {
  const headers = STUDENT_IMPORT_COLUMNS.map((column) => columnHeaderLabel(column));
  const rows = STUDENT_IMPORT_SAMPLE_ROWS.map(sampleRowValues);
  const escape = (value: string) => {
    if (/[",\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  return [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

export function buildImportTemplateXlsx(): Buffer {
  const workbook = XLSX.utils.book_new();

  const dataHeaders = STUDENT_IMPORT_COLUMNS.map(columnHeaderLabel);
  const dataRows = STUDENT_IMPORT_SAMPLE_ROWS.map(sampleRowValues);
  const dataSheet = XLSX.utils.aoa_to_sheet([dataHeaders, ...dataRows]);
  dataSheet["!cols"] = STUDENT_IMPORT_COLUMNS.map((column) => ({
    wch: column.width ?? 16,
  }));
  dataSheet["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", activePane: "bottomLeft" };
  XLSX.utils.book_append_sheet(workbook, dataSheet, "Student Import");

  const guideSheet = XLSX.utils.aoa_to_sheet(GUIDE_LINES);
  guideSheet["!cols"] = [{ wch: 96 }];
  XLSX.utils.book_append_sheet(workbook, guideSheet, "Instructions");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

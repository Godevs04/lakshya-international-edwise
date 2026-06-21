import * as XLSX from "xlsx";

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
  { key: "loanRequested", label: "Loan Requested (INR)", width: 18 },
  { key: "loanSanctioned", label: "Loan Sanctioned (INR)", width: 18 },
  { key: "loanDisbursed", label: "Loan Disbursed (INR)", width: 18 },
  { key: "interest", label: "Interest Rate (%)", width: 14 },
  { key: "bankName", label: "Bank Name", width: 16 },
  { key: "applicationNumber", label: "Application Number", width: 18 },
  { key: "partnerCompanyName", label: "Partner Company", width: 20 },
  { key: "status", label: "Status", width: 18 },
  { key: "remarks", label: "Remarks", width: 30 },
];

export const STUDENT_IMPORT_SAMPLE_ROWS: Record<StudentImportColumnKey, string>[] = [
  {
    firstName: "Kavin",
    lastName: "Kumar",
    phone: "9898989898",
    whatsapp: "9898989898",
    email: "kavin.kumar@testimport.in",
    gender: "male",
    dob: "2000-05-18",
    addressLine: "14 Residency Road, Abids",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
    aadhaar: "678901234567",
    pan: "FGHIJ6789K",
    college: "Osmania University",
    course: "B.Tech Information Technology",
    year: "2",
    loanRequested: "720000",
    loanSanctioned: "700000",
    loanDisbursed: "350000",
    interest: "7.65",
    bankName: "Union Bank of India",
    applicationNumber: "UBI-EDU-2026-2201",
    partnerCompanyName: "Godevs",
    status: "sanctioned",
    remarks: "Second tranche disbursement pending",
  },
  {
    firstName: "Meera",
    lastName: "Nair",
    phone: "9789789789",
    whatsapp: "9789789789",
    email: "meera.nair@testimport.in",
    gender: "female",
    dob: "2001-08-22",
    addressLine: "9 Palayam Road, Statue Junction",
    city: "Thiruvananthapuram",
    state: "Kerala",
    pincode: "695001",
    aadhaar: "789012345678",
    pan: "GHIJK7890L",
    college: "University of Kerala",
    course: "M.Sc Data Science",
    year: "1",
    loanRequested: "950000",
    loanSanctioned: "0",
    loanDisbursed: "0",
    interest: "8.4",
    bankName: "Federal Bank",
    applicationNumber: "FBL-EDU-2026-1188",
    partnerCompanyName: "Rooted",
    status: "under_verification",
    remarks: "Income documents under bank review",
  },
  {
    firstName: "Arjun",
    lastName: "Reddy",
    phone: "9679679678",
    whatsapp: "9679679678",
    email: "arjun.reddy@testimport.in",
    gender: "male",
    dob: "1999-12-03",
    addressLine: "33 Benz Circle, Labbipet",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    pincode: "520010",
    aadhaar: "890123456789",
    pan: "HIJKL8901M",
    college: "Andhra University",
    course: "BBA Banking",
    year: "3",
    loanRequested: "580000",
    loanSanctioned: "580000",
    loanDisbursed: "580000",
    interest: "7.35",
    bankName: "Bank of Baroda",
    applicationNumber: "BOB-EDU-2026-0445",
    partnerCompanyName: "Godevs",
    status: "disbursed",
    remarks: "Loan credited to institute fee account",
  },
  {
    firstName: "Sofia",
    lastName: "Thomas",
    phone: "9569569567",
    whatsapp: "",
    email: "sofia.thomas@testimport.in",
    gender: "female",
    dob: "2002-04-14",
    addressLine: "61 Hill Road, Bandra West",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400050",
    aadhaar: "",
    pan: "",
    college: "St. Xavier's College",
    course: "B.Com Accounting",
    year: "2",
    loanRequested: "390000",
    loanSanctioned: "0",
    loanDisbursed: "0",
    interest: "8.75",
    bankName: "Kotak Mahindra Bank",
    applicationNumber: "",
    partnerCompanyName: "Rooted",
    status: "contacted",
    remarks: "Parent meeting scheduled for next week",
  },
  {
    firstName: "Dev",
    lastName: "Malhotra",
    phone: "9459459456",
    whatsapp: "9459459456",
    email: "dev.malhotra@testimport.in",
    gender: "male",
    dob: "2000-10-27",
    addressLine: "28 Connaught Place, Block C",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001",
    aadhaar: "901234567890",
    pan: "IJKLM9012N",
    college: "Delhi Technological University",
    course: "B.Arch",
    year: "4",
    loanRequested: "1100000",
    loanSanctioned: "1050000",
    loanDisbursed: "0",
    interest: "8.15",
    bankName: "Punjab National Bank",
    applicationNumber: "PNB-EDU-2026-0772",
    partnerCompanyName: "Godevs",
    status: "approved",
    remarks: "Awaiting final sanction letter from branch",
  },
];

const GUIDE_LINES = [
  ["Lakshya International Edwise"],
  ["Student Bulk Import Template"],
  [""],
  ["How to use"],
  ["1. Open the \"Student Import\" sheet (first tab)."],
  ["2. Replace the 5 sample rows with your student data, or add rows below them."],
  ["3. Keep the header row unchanged. Fields marked with * are required."],
  ["4. Save the file and upload it from Dashboard → Students → Import."],
  [""],
  ["Field notes"],
  ["• Gender: male, female, or other"],
  ["• Date of Birth: use YYYY-MM-DD (e.g. 2001-03-12)"],
  ["• Loan amounts: enter numbers only, without commas or currency symbols"],
  ["• Interest Rate: percentage value between 0 and 100 (e.g. 7.8)"],
  ["• Partner Company: must match an existing partner name in the CRM"],
  [
    "• Status: new, contacted, documents_pending, submitted, under_verification, approved, sanctioned, disbursed, rejected, or closed",
  ],
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
  guideSheet["!cols"] = [{ wch: 92 }];
  XLSX.utils.book_append_sheet(workbook, guideSheet, "Instructions");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

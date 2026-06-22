import { formatCurrency, formatDate, formatPercent } from "@/lib/utils/format";
import { maskAadhaar, maskPan } from "@/lib/utils/pii";

export type ReportSourceRow = Record<string, unknown>;

type LooseRecord = ReportSourceRow;

function partnerName(partnerId: unknown): string {
  if (!partnerId || typeof partnerId !== "object") return "";
  if ("companyName" in partnerId && typeof partnerId.companyName === "string") {
    return partnerId.companyName;
  }
  return "";
}

function joinAddress(address: unknown): string {
  if (!address || typeof address !== "object") return "";
  const line = "line" in address ? String(address.line ?? "") : "";
  const city = "city" in address ? String(address.city ?? "") : "";
  const state = "state" in address ? String(address.state ?? "") : "";
  const pincode = "pincode" in address ? String(address.pincode ?? "") : "";
  return [line, city, state, pincode].filter(Boolean).join(", ");
}

function latestTimelineEntry(timeline: unknown): { status: string; note: string; by: string; on: string } {
  if (!Array.isArray(timeline) || timeline.length === 0) {
    return { status: "", note: "", by: "", on: "" };
  }
  const entry = timeline[timeline.length - 1] as LooseRecord;
  return {
    status: String(entry.status ?? ""),
    note: String(entry.note ?? ""),
    by: String(entry.createdByName ?? ""),
    on: entry.createdAt ? formatDate(String(entry.createdAt)) : "",
  };
}

export function formatStudentReportRows(students: LooseRecord[]): Record<string, string | number>[] {
  return students.map((student) => {
    const education = student.education as LooseRecord | undefined;
    const loan = student.loan as LooseRecord | undefined;
    const metadata = student.metadata as LooseRecord | undefined;
    const timeline = latestTimelineEntry(student.timeline);
    const documents = Array.isArray(student.documents) ? student.documents : [];
    const notes = Array.isArray(student.notes) ? student.notes : [];

    return {
      "Student ID": String(student.studentId ?? ""),
      "Full Name": `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim(),
      Gender: String(student.gender ?? ""),
      "Date of Birth": student.dob ? formatDate(String(student.dob)) : "",
      Phone: String(student.phone ?? ""),
      WhatsApp: String(student.whatsapp ?? ""),
      Email: String(student.email ?? ""),
      Address: joinAddress(student.address),
      Aadhaar: maskAadhaar(student.aadhaar as string | undefined) ?? "",
      PAN: maskPan(student.pan as string | undefined) ?? "",
      College: String(education?.college ?? ""),
      Course: String(education?.course ?? ""),
      Year: String(education?.year ?? ""),
      "Loan Requested": formatCurrency(Number(loan?.requested ?? 0)),
      "Loan Sanctioned": formatCurrency(Number(loan?.sanctioned ?? 0)),
      "Loan Disbursed": formatCurrency(Number(loan?.disbursed ?? 0)),
      "Interest %": loan?.interest != null ? `${loan.interest}%` : "",
      Bank: String(loan?.bankName ?? ""),
      "Bank LAN": String(loan?.applicationNumber ?? ""),
      Partner: partnerName(student.partnerId),
      Status: String(student.status ?? ""),
      Remarks: String(student.remarks ?? ""),
      Documents: documents.length,
      Notes: notes.length,
      "Last Status": timeline.status,
      "Last Update Note": timeline.note,
      "Last Updated By": timeline.by,
      "Last Updated On": timeline.on,
      "Created By": String(metadata?.createdByName ?? ""),
      "Created On": student.createdAt ? formatDate(String(student.createdAt)) : "",
      "Updated On": student.updatedAt ? formatDate(String(student.updatedAt)) : "",
    };
  });
}

export function formatPartnerReportRows(partners: LooseRecord[]): Record<string, string | number>[] {
  return partners.map((partner) => ({
    Company: String(partner.companyName ?? ""),
    Students: Number(partner.studentsCount ?? 0),
    "Total Loan Value": formatCurrency(Number(partner.totalLoanValue ?? 0)),
    "Commission %": partner.commissionPercent != null ? formatPercent(Number(partner.commissionPercent)) : "",
    "Commission Earned": formatCurrency(Number(partner.commissionEarned ?? 0)),
    "Commission Settled": formatCurrency(Number(partner.commissionSettled ?? 0)),
    "Pending Commission": formatCurrency(
      Math.max(0, Number(partner.commissionEarned ?? 0) - Number(partner.commissionSettled ?? 0))
    ),
    Status: String(partner.status ?? ""),
  }));
}

export function formatLoanReportRows(rows: LooseRecord[]): Record<string, string | number>[] {
  return rows.map((row) => ({
    Status: String(row._id ?? ""),
    Count: Number(row.count ?? 0),
    "Total Requested": formatCurrency(Number(row.totalRequested ?? 0)),
    "Total Sanctioned": formatCurrency(Number(row.totalSanctioned ?? 0)),
    "Total Disbursed": formatCurrency(Number(row.totalDisbursed ?? 0)),
  }));
}

export function formatReportRows(
  reportType: "partner" | "student" | "loan",
  rows: LooseRecord[]
): Record<string, string | number>[] {
  switch (reportType) {
    case "student":
      return formatStudentReportRows(rows);
    case "partner":
      return formatPartnerReportRows(rows);
    case "loan":
      return formatLoanReportRows(rows);
  }
}

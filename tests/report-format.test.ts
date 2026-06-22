import { describe, expect, it } from "vitest";
import {
  formatLoanReportRows,
  formatPartnerReportRows,
  formatStudentReportRows,
} from "@/lib/utils/report-format";

describe("report-format", () => {
  it("formats student rows for business reports", () => {
    const rows = formatStudentReportRows([
      {
        studentId: "STU-LIE-000004",
        firstName: "Abdullah",
        lastName: "A S M",
        gender: "male",
        dob: new Date("2000-07-20"),
        phone: "8667723123",
        whatsapp: "8667723123",
        email: "abdullahasm@gmail.com",
        address: {
          line: "11/A Sana Fathima Mantion",
          city: "BANGALORE",
          state: "Karnataka",
          pincode: "560068",
        },
        aadhaar: "plain-not-encrypted-1234",
        pan: "ABCDE1234F",
        education: { college: "Kongu Engineering College", course: "MCA", year: "2024" },
        loan: {
          requested: 4000000,
          sanctioned: 0,
          disbursed: 0,
          interest: 0,
          bankName: "CUB",
          applicationNumber: "KJSADNB2938YR8171",
        },
        partnerId: { companyName: "Godevs" },
        status: "submitted",
        remarks: "Priority case",
        documents: [{ name: "aadhaar.pdf" }],
        notes: [],
        timeline: [
          {
            status: "submitted",
            note: "Application filed",
            createdByName: "Super Admin",
            createdAt: new Date("2026-06-21T13:05:19.093Z"),
          },
        ],
        metadata: { createdByName: "Super Admin" },
        createdAt: new Date("2026-06-21T13:05:19.103Z"),
        updatedAt: new Date("2026-06-21T13:05:19.103Z"),
      },
    ]);

    expect(rows[0]?.["Student ID"]).toBe("STU-LIE-000004");
    expect(rows[0]?.["Full Name"]).toBe("Abdullah A S M");
    expect(rows[0]?.Address).toContain("BANGALORE");
    expect(rows[0]?.Partner).toBe("Godevs");
    expect(rows[0]?.["Loan Requested"]).toContain("40,00,000");
    expect(rows[0]?.["Bank LAN"]).toBe("KJSADNB2938YR8171");
    expect(rows[0]?.Documents).toBe(1);
    expect(rows[0]?.["Last Status"]).toBe("submitted");
    expect(rows[0]?.["Last Update Note"]).toBe("Application filed");
    expect(rows[0]?.id).toBeUndefined();
    expect(rows[0]?.timeline).toBeUndefined();
  });

  it("formats partner and loan rows", () => {
    const partners = formatPartnerReportRows([
      {
        companyName: "Godevs",
        studentsCount: 12,
        totalLoanValue: 5000000,
        commissionPercent: 2,
        commissionEarned: 100000,
        status: "active",
      },
    ]);

    expect(partners[0]?.Company).toBe("Godevs");
    expect(partners[0]?.Students).toBe(12);
    expect(partners[0]?.["Commission Payout"]).toContain("1,00,000");

    const loans = formatLoanReportRows([
      {
        _id: "submitted",
        count: 3,
        totalRequested: 9000000,
        totalSanctioned: 2000000,
        totalDisbursed: 1000000,
      },
    ]);

    expect(loans[0]?.Status).toBe("submitted");
    expect(loans[0]?.Count).toBe(3);
  });
});

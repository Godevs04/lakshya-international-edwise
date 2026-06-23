import { describe, expect, it } from "vitest";
import {
  documentMatchesChecklistItem,
  getDocumentChecklistProgress,
  getStudentProfileCompleteness,
  isStudentProfileVerified,
} from "@/lib/utils/student-profile";

describe("student profile utilities", () => {
  it("matches checklist items by document name keywords", () => {
    expect(documentMatchesChecklistItem("Passport front scan", ["passport"])).toBe(true);
    expect(documentMatchesChecklistItem("Random file", ["passport"])).toBe(false);
  });

  it("calculates document checklist progress", () => {
    const progress = getDocumentChecklistProgress([
      { name: "Passport copy" },
      { name: "PAN card" },
      { name: "Offer letter from university" },
    ]);

    expect(progress.uploaded).toBe(3);
    expect(progress.total).toBeGreaterThan(3);
    expect(progress.percent).toBeGreaterThan(0);
    expect(progress.items.find((item) => item.id === "passport")?.uploaded).toBe(true);
  });

  it("calculates profile completeness", () => {
    const result = getStudentProfileCompleteness({
      phone: "9363047040",
      email: "student@example.com",
      gender: "male",
      dob: new Date("2000-01-01"),
      targetCountry: "United Kingdom",
      targetIntake: "Fall 2026 (Aug - Sep)",
      targetDegree: "Masters/MBA",
      address: { city: "Chennai", state: "Tamil Nadu" },
      education: { college: "Anna University", course: "MBA" },
      loan: { requested: 1500000, bankName: "HDFC" },
      partnerName: "Partner A",
      hasAadhaar: true,
      hasPan: true,
    });

    expect(result.percent).toBeGreaterThanOrEqual(85);
    expect(result.isComplete).toBe(true);
  });

  it("marks profile verified when fields and documents meet thresholds", () => {
    const documents = [
      { name: "Passport" },
      { name: "Aadhaar card" },
      { name: "PAN card" },
      { name: "Offer letter" },
      { name: "Bank statement" },
      { name: "10th marksheet" },
      { name: "Degree certificate" },
    ];

    const verified = isStudentProfileVerified(
      {
        phone: "9363047040",
        email: "student@example.com",
        gender: "male",
        dob: new Date("2000-01-01"),
        targetCountry: "United Kingdom",
        targetIntake: "Fall 2026 (Aug - Sep)",
        targetDegree: "Masters/MBA",
        address: { city: "Chennai", state: "Tamil Nadu" },
        education: { college: "Anna University", course: "MBA" },
        loan: { requested: 1500000, bankName: "HDFC" },
        partnerName: "Partner A",
        hasAadhaar: true,
        hasPan: true,
        documents,
      },
      documents
    );

    expect(verified).toBe(true);
  });
});

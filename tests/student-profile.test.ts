import { describe, expect, it } from "vitest";
import {
  getStudentProfileCompleteness,
  isStudentProfileVerified,
} from "@/lib/utils/student-profile";

describe("student profile utilities", () => {
  it("calculates profile completeness with university and lender", () => {
    const result = getStudentProfileCompleteness({
      phone: "9363047040",
      email: "student@example.com",
      targetCountry: "United Kingdom",
      targetIntake: "Fall 2026 (Aug - Sep)",
      targetUniversity: "University of Edinburgh",
      address: { city: "Chennai", state: "Tamil Nadu" },
      loan: { requested: 1500000, lenderId: "lender-id" },
      partnerName: "Partner A",
    });

    expect(result.percent).toBeGreaterThanOrEqual(85);
    expect(result.isComplete).toBe(true);
    expect(result.missingFields).not.toContain("University");
    expect(result.missingFields).not.toContain("Lender");
  });

  it("marks profile verified when required fields meet threshold", () => {
    const verified = isStudentProfileVerified({
      phone: "9363047040",
      email: "student@example.com",
      targetCountry: "United Kingdom",
      targetIntake: "Fall 2026 (Aug - Sep)",
      targetUniversity: "University of Edinburgh",
      address: { city: "Chennai", state: "Tamil Nadu" },
      loan: { requested: 1500000, lenderId: "lender-id" },
      partnerName: "Partner A",
    });

    expect(verified).toBe(true);
  });

  it("marks profile incomplete when university is missing", () => {
    const result = getStudentProfileCompleteness({
      phone: "9363047040",
      email: "student@example.com",
      targetCountry: "United Kingdom",
      targetIntake: "Fall 2026 (Aug - Sep)",
      address: { city: "Chennai", state: "Tamil Nadu" },
      loan: { requested: 1500000 },
      partnerName: "Partner A",
    });

    expect(result.missingFields).toContain("University");
    expect(result.missingFields).toContain("Lender");
    expect(result.isComplete).toBe(false);
  });
});

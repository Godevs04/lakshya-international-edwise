import { describe, expect, it } from "vitest";
import {
  EDUCATION_LOAN_OPTIONS,
  EDUCATION_LOAN_TYPE_DETAILS,
  getEducationLoanOptionHref,
  getEducationLoanTypeDetail,
} from "@/lib/constants/marketing/education-loan-options";
import {
  getLenderCollateralLabel,
  LENDER_CATEGORY_ORDER,
  MARKETING_LENDERS,
} from "@/lib/constants/marketing/lenders";
import { MARKETING_NAV } from "@/lib/constants/marketing/navigation";
import { getMarketingService } from "@/lib/constants/marketing/services";

describe("education loan type details", () => {
  it("exposes exactly three product types without cosigner", () => {
    expect(EDUCATION_LOAN_TYPE_DETAILS).toHaveLength(3);
    expect(EDUCATION_LOAN_OPTIONS.map((option) => option.slug)).toEqual([
      "without-guarantor",
      "non-collateral",
      "collateral",
    ]);
    expect(
      EDUCATION_LOAN_TYPE_DETAILS.some((entry) => /cosigner/i.test(entry.slug + entry.title))
    ).toBe(false);
  });

  it("keeps detailed guides aligned with overview cards", () => {
    for (const option of EDUCATION_LOAN_OPTIONS) {
      const detail = getEducationLoanTypeDetail(option.slug);
      expect(detail, option.slug).toBeDefined();
      expect(detail?.title).toBe(option.title);
      expect(detail?.shortDescription).toBe(option.shortDescription);
      expect(detail?.summary.length).toBeGreaterThanOrEqual(2);
      expect(detail?.benefits.length).toBeGreaterThanOrEqual(5);
      expect(detail?.checklist.length).toBeGreaterThanOrEqual(2);
      expect(detail?.checklist.every((group) => group.items.length > 0)).toBe(true);
      expect(getEducationLoanOptionHref(option.slug)).toBe(
        `/services/education-loan#${option.slug}`
      );
    }
  });

  it("wires education-loan service sub-options and nav anchors", () => {
    const service = getMarketingService("education-loan");
    expect(service?.subOptions?.map((option) => option.slug)).toEqual([
      "without-guarantor",
      "non-collateral",
      "collateral",
    ]);

    const servicesNav = MARKETING_NAV.find((item) => item.href === "/services");
    const hrefs = servicesNav?.children?.map((child) => child.href) ?? [];
    expect(hrefs).toContain("/services/education-loan#without-guarantor");
    expect(hrefs).toContain("/services/education-loan#non-collateral");
    expect(hrefs).toContain("/services/education-loan#collateral");
    expect(hrefs).toContain("/services/education-loan#compare-lenders");
  });
});

describe("lender comparison data", () => {
  it("covers every lender category used by the compare UI", () => {
    for (const category of LENDER_CATEGORY_ORDER) {
      expect(MARKETING_LENDERS.some((lender) => lender.category === category)).toBe(true);
    }
    expect(MARKETING_LENDERS.length).toBeGreaterThanOrEqual(12);
  });

  it("labels collateral consistently for public, private, and NBFC partners", () => {
    const sbi = MARKETING_LENDERS.find((lender) => lender.slug === "sbi");
    const axis = MARKETING_LENDERS.find((lender) => lender.slug === "axis-bank");
    const credila = MARKETING_LENDERS.find((lender) => lender.slug === "credila");
    const incred = MARKETING_LENDERS.find((lender) => lender.slug === "incred");

    expect(sbi && getLenderCollateralLabel(sbi)).toBe("Collateral mandatory");
    expect(axis && getLenderCollateralLabel(axis)).toBe("Not mandatory");
    expect(credila && getLenderCollateralLabel(credila)).toBe("Not mandatory");
    expect(incred && getLenderCollateralLabel(incred)).toBe("No collateral");
  });

  it("uses cost-of-education copy for private bank max loan amounts", () => {
    const privateBanks = MARKETING_LENDERS.filter((lender) => lender.category === "private");
    expect(privateBanks.length).toBeGreaterThan(0);
    for (const lender of privateBanks) {
      expect(lender.maxLoanLabel).toBe("Cost of education");
    }
  });
});

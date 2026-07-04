import { describe, expect, it } from "vitest";
import { parseWebsiteLoanAmount } from "@/lib/utils/website-loan-amount";

describe("parseWebsiteLoanAmount", () => {
  it("parses lakh amounts", () => {
    expect(parseWebsiteLoanAmount("40 Lakh")).toBe(4_000_000);
    expect(parseWebsiteLoanAmount("₹40 Lakh")).toBe(4_000_000);
    expect(parseWebsiteLoanAmount("1.5 lakh")).toBe(150_000);
  });

  it("parses crore amounts", () => {
    expect(parseWebsiteLoanAmount("1 Cr")).toBe(10_000_000);
    expect(parseWebsiteLoanAmount("2.5 crore")).toBe(25_000_000);
  });

  it("parses plain numeric rupee values", () => {
    expect(parseWebsiteLoanAmount("5000000")).toBe(5_000_000);
    expect(parseWebsiteLoanAmount("₹12,50,000")).toBe(1_250_000);
  });

  it("returns 0 for empty or unparseable input", () => {
    expect(parseWebsiteLoanAmount("")).toBe(0);
    expect(parseWebsiteLoanAmount(undefined)).toBe(0);
    expect(parseWebsiteLoanAmount("not sure yet")).toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import {
  formatPersonName,
  isPlaceholderLastName,
  normalizeLastName,
  splitFullName,
} from "@/lib/utils/person-name";

describe("person-name utils", () => {
  it("splits multi-word names into first and last", () => {
    expect(splitFullName("Kavin Kumar")).toEqual({
      firstName: "Kavin",
      lastName: "Kumar",
    });
  });

  it("does not append a placeholder last name for single-word names", () => {
    expect(splitFullName("GOWTHAM")).toEqual({
      firstName: "GOWTHAM",
      lastName: "",
    });
  });

  it("formats names without placeholder last names", () => {
    expect(formatPersonName("GOWTHAM", ".")).toBe("GOWTHAM");
    expect(formatPersonName("Kavin", "Kumar")).toBe("Kavin Kumar");
  });

  it("detects and normalizes placeholder last names", () => {
    expect(isPlaceholderLastName(".")).toBe(true);
    expect(normalizeLastName(".")).toBe("");
    expect(normalizeLastName("Kumar")).toBe("Kumar");
  });
});

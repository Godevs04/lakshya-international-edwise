import { describe, expect, it } from "vitest";
import { escapeRegExp, sanitizeText, toSafeRegExp } from "@/lib/utils/sanitize";

describe("sanitize", () => {
  it("escapes regex metacharacters", () => {
    expect(escapeRegExp("(a+)+$")).toBe("\\(a\\+\\)\\+\\$");
  });

  it("builds safe regex from user input", () => {
    const regex = toSafeRegExp("(test.*)");
    expect(regex.test("(test.*)")).toBe(true);
    expect(regex.test("aaaa")).toBe(false);
  });

  it("strips HTML from text", () => {
    expect(sanitizeText("<script>alert(1)</script>Hello")).toBe("alert(1)Hello");
  });
});

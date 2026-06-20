import { describe, expect, it } from "vitest";
import { isAuthError } from "@/lib/action-utils";

describe("action-utils", () => {
  it("detects authorization errors", () => {
    expect(isAuthError(new Error("Unauthorized: insufficient permissions"))).toBe(true);
    expect(isAuthError(new Error("Something else"))).toBe(false);
    expect(isAuthError("Unauthorized")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  formatAuditAction,
  formatAuditMetadata,
  getAuditActionTone,
  getAuditResourceHref,
} from "@/lib/utils/audit-format";

describe("audit-format", () => {
  it("formats audit actions for display", () => {
    expect(formatAuditAction("student.updated")).toBe("Student · Updated");
    expect(formatAuditAction("students.imported")).toBe("Students · Imported");
  });

  it("builds resource links for supported types", () => {
    expect(getAuditResourceHref("student", "abc123")).toBe("/dashboard/students/abc123");
    expect(getAuditResourceHref("admission", "abc123")).toBe("/dashboard/admissions/abc123");
    expect(getAuditResourceHref("lender", "abc123")).toBe("/dashboard/lenders");
    expect(getAuditResourceHref("user", "abc123")).toBe("/dashboard/settings");
    expect(getAuditResourceHref("settings", "company")).toBe("/dashboard/settings");
  });

  it("summarizes metadata", () => {
    expect(formatAuditMetadata({ imported: 5, failed: 1 })).toBe("imported: 5 · failed: 1");
  });

  it("applies action tone classes", () => {
    expect(getAuditActionTone("student.deleted")).toContain("EF4444");
    expect(getAuditActionTone("student.created")).toContain("22C55E");
  });
});

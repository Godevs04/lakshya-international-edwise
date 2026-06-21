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
    expect(getAuditResourceHref("settings", "abc123")).toBeUndefined();
  });

  it("summarizes metadata", () => {
    expect(formatAuditMetadata({ imported: 5, failed: 1 })).toBe("imported: 5 · failed: 1");
  });

  it("applies action tone classes", () => {
    expect(getAuditActionTone("student.deleted")).toContain("EF4444");
    expect(getAuditActionTone("student.created")).toContain("22C55E");
  });
});

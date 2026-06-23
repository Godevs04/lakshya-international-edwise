import { describe, expect, it } from "vitest";
import { taskSchema } from "@/lib/validations/schemas";

describe("taskSchema", () => {
  it("requires title, assignee, and due date", () => {
    const result = taskSchema.safeParse({
      title: "Follow up",
      assignedToId: "6a3a940abd5189389bff13f8",
      dueAt: "2026-06-21T10:00",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid assignee id", () => {
    const result = taskSchema.safeParse({
      title: "Follow up",
      assignedToId: "__unassigned__",
      dueAt: "2026-06-21T10:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing assignee", () => {
    const result = taskSchema.safeParse({
      title: "Follow up",
      dueAt: "2026-06-21T10:00",
    });
    expect(result.success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  canViewAllOverdueTasks,
  resolveOverdueTaskCount,
} from "@/lib/utils/task-overdue";

describe("task overdue visibility", () => {
  it("lets admin and super admin view all overdue tasks", () => {
    expect(canViewAllOverdueTasks("admin")).toBe(true);
    expect(canViewAllOverdueTasks("super_admin")).toBe(true);
    expect(canViewAllOverdueTasks("manager")).toBe(false);
    expect(canViewAllOverdueTasks("staff")).toBe(false);
  });

  it("returns all overdue count for admins", () => {
    expect(
      resolveOverdueTaskCount({
        role: "admin",
        myOverdue: 1,
        allOverdue: 5,
      })
    ).toBe(5);
  });

  it("returns only assigned overdue count for other users", () => {
    expect(
      resolveOverdueTaskCount({
        role: "staff",
        myOverdue: 2,
        allOverdue: 5,
      })
    ).toBe(2);
  });
});

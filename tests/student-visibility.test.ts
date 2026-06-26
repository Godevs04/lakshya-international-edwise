import { describe, expect, it } from "vitest";
import {
  buildStudentVisibilityFilter,
  canAccessStudent,
  canBypassStudentVisibility,
} from "@/lib/services/student-visibility.service";
import type { SessionUser } from "@/types";

const SUPER_ADMIN_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const STAFF_B_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";
const MANAGER_C_ID = "cccccccccccccccccccccccc";

function user(role: SessionUser["role"], id: string): SessionUser {
  return {
    id,
    email: `${role}@example.com`,
    name: role,
    role,
    permissions: [],
  };
}

describe("student-visibility", () => {
  it("lets super admin bypass visibility filters", () => {
    expect(canBypassStudentVisibility("super_admin")).toBe(true);
    expect(buildStudentVisibilityFilter(user("super_admin", SUPER_ADMIN_ID))).toBeNull();
  });

  it("lets staff see students they created", () => {
    const staff = user("staff", STAFF_B_ID);
    const student = { metadata: { createdBy: STAFF_B_ID } };

    expect(canAccessStudent(staff, student)).toBe(true);
  });

  it("lets staff see students assigned to them", () => {
    const staff = user("staff", STAFF_B_ID);
    const student = {
      metadata: { createdBy: SUPER_ADMIN_ID },
      assignedTo: STAFF_B_ID,
    };

    expect(canAccessStudent(staff, student)).toBe(true);
  });

  it("hides super admin created students from other users until assigned", () => {
    const staff = user("staff", STAFF_B_ID);
    const manager = user("manager", MANAGER_C_ID);
    const student = { metadata: { createdBy: SUPER_ADMIN_ID } };

    expect(canAccessStudent(staff, student)).toBe(false);
    expect(canAccessStudent(manager, student)).toBe(false);
    expect(canAccessStudent(user("super_admin", SUPER_ADMIN_ID), student)).toBe(true);
  });

  it("hides another team member's unassigned students", () => {
    const manager = user("manager", MANAGER_C_ID);
    const student = { metadata: { createdBy: STAFF_B_ID } };

    expect(canAccessStudent(manager, student)).toBe(false);
  });

  it("builds a mongo filter for non-super-admin users", () => {
    const filter = buildStudentVisibilityFilter(user("staff", STAFF_B_ID));

    expect(filter).toEqual({
      $or: [
        { "metadata.createdBy": expect.anything() },
        { assignedTo: expect.anything() },
      ],
    });
  });
});

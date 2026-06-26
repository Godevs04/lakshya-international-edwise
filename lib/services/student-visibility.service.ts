import { Types } from "mongoose";
import type { SessionUser } from "@/types";

export type StudentAccessRecord = {
  metadata?: {
    createdBy?: Types.ObjectId | string | { _id?: Types.ObjectId; toString(): string } | null;
  } | null;
  assignedTo?: Types.ObjectId | string | { _id?: Types.ObjectId; toString(): string } | null;
};

export function canBypassStudentVisibility(role: SessionUser["role"]): boolean {
  return role === "super_admin";
}

export function resolveObjectId(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    if ("_id" in value && value._id) {
      return String(value._id);
    }
    if ("toString" in value && typeof value.toString === "function") {
      const asString = value.toString();
      if (/^[a-f\d]{24}$/i.test(asString)) {
        return asString;
      }
    }
  }
  return undefined;
}

export function canAccessStudent(
  user: SessionUser | null | undefined,
  student: StudentAccessRecord | null | undefined
): boolean {
  if (!user || !student) return false;
  if (canBypassStudentVisibility(user.role)) return true;

  const userId = user.id;
  const createdBy = resolveObjectId(student.metadata?.createdBy);
  const assignedTo = resolveObjectId(student.assignedTo);

  return createdBy === userId || assignedTo === userId;
}

export function buildStudentVisibilityFilter(
  user: SessionUser | null | undefined
): Record<string, unknown> | null {
  if (!user) {
    return { _id: null };
  }
  if (canBypassStudentVisibility(user.role)) {
    return null;
  }

  const userObjectId = new Types.ObjectId(user.id);
  return {
    $or: [{ "metadata.createdBy": userObjectId }, { assignedTo: userObjectId }],
  };
}

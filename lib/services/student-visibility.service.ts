import { Types } from "mongoose";
import type { SessionUser } from "@/types";

export type StudentAccessRecord = {
  metadata?: {
    createdBy?: Types.ObjectId | string | { _id?: Types.ObjectId; toString(): string } | null;
    createdByName?: string;
    leadSource?: string;
    enquiryType?: string;
    formPage?: string;
  } | null;
  assignedTo?: Types.ObjectId | string | { _id?: Types.ObjectId; toString(): string } | null;
};

export function canBypassStudentVisibility(role: SessionUser["role"]): boolean {
  return role === "super_admin";
}

export function isWebsiteInboundLead(student: StudentAccessRecord | null | undefined): boolean {
  if (!student?.metadata) return false;
  if (student.metadata.leadSource === "website") return true;
  return (
    student.metadata.createdByName === "Website" &&
    !resolveObjectId(student.metadata.createdBy)
  );
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
  if (isWebsiteInboundLead(student)) return true;

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

/** Admissions list/detail: include public website enquiries for all admissions users. */
export function buildAdmissionVisibilityFilter(
  user: SessionUser | null | undefined
): Record<string, unknown> | null {
  const base = buildStudentVisibilityFilter(user);
  if (!user || canBypassStudentVisibility(user.role)) {
    return base;
  }

  const websiteClause = { "metadata.leadSource": "website" };
  if (!base) {
    return null;
  }

  const baseOr = Array.isArray(base.$or) ? base.$or : [];
  return {
    $or: [...baseOr, websiteClause],
  };
}

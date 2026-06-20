"use server";

import { revalidatePath } from "next/cache";
import { revalidateInsightCaches } from "@/lib/cache/revalidate";
import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { Partner } from "@/models/Partner";
import { Application } from "@/models/Application";
import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { logActivity } from "@/lib/services/activity.service";
import { studentSchema, noteSchema } from "@/lib/validations/schemas";
import { sanitizeText, toSafeRegExp } from "@/lib/utils/sanitize";
import { encryptSensitiveField, maskAadhaar, maskPan } from "@/lib/utils/pii";
import { generateStudentId } from "@/lib/utils/format";
import type { ActionResult, PaginatedResult, StudentListItem } from "@/types";
import type { StudentStatus } from "@/lib/constants/statuses";
import { Types } from "mongoose";
import { validateCloudinaryDocument } from "@/lib/services/upload.service";
import { runLoggedMutation, runLoggedQuery, emptyPaginated } from "@/lib/action-utils";

export async function getStudents(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  partnerId?: string;
  state?: string;
  college?: string;
  course?: string;
  bank?: string;
}): Promise<PaginatedResult<StudentListItem>> {
  return runLoggedQuery("getStudents", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.STUDENTS_READ);

  await connectDB();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const skip = (page - 1) * pageSize;

  const filter: Record<string, unknown> = {};

  if (params.search) {
    const regex = toSafeRegExp(params.search);
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { phone: regex },
      { email: regex },
      { studentId: regex },
    ];
  }
  if (params.status) filter.status = params.status;
  if (params.partnerId) filter.partnerId = params.partnerId;
  if (params.state) filter["address.state"] = params.state;
  if (params.college) filter["education.college"] = toSafeRegExp(params.college);
  if (params.course) filter["education.course"] = toSafeRegExp(params.course);
  if (params.bank) filter["loan.bankName"] = toSafeRegExp(params.bank);

  const [data, total] = await Promise.all([
    Student.find(filter)
      .populate("partnerId", "companyName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Student.countDocuments(filter),
  ]);

  return {
    data: data.map((s) => ({
      _id: s._id.toString(),
      studentId: s.studentId,
      firstName: s.firstName,
      lastName: s.lastName,
      phone: s.phone,
      email: s.email,
      status: s.status as StudentStatus,
      partnerName: (s.partnerId as { companyName?: string } | null)?.companyName,
      loanRequested: s.loan?.requested,
      createdAt: s.createdAt,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
  }, emptyPaginated(params.page ?? 1, params.pageSize ?? 10));
}

export async function getStudentById(id: string) {
  return runLoggedQuery("getStudentById", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.STUDENTS_READ);

  await connectDB();
  const student = await Student.findById(id).populate("partnerId").lean();
  if (!student) return null;

  return {
    ...student,
    aadhaar: maskAadhaar(student.aadhaar),
    pan: maskPan(student.pan),
  };
  }, null);
}

export async function getStudentForEdit(id: string) {
  return runLoggedQuery("getStudentForEdit", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

  await connectDB();
  const student = await Student.findById(id).lean();
  if (!student) return null;

  return {
    ...student,
    aadhaar: maskAadhaar(student.aadhaar),
    pan: maskPan(student.pan),
  };
  }, null);
}

export async function createStudentAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  return runLoggedMutation("createStudentAction", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

  const raw = Object.fromEntries(formData.entries());
  const parsed = studentSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  await connectDB();
  const data = parsed.data;
  const studentId = generateStudentId();

  const student = await Student.create({
    studentId,
    firstName: sanitizeText(data.firstName),
    lastName: sanitizeText(data.lastName),
    gender: data.gender,
    dob: data.dob ? new Date(data.dob) : undefined,
    phone: data.phone,
    whatsapp: data.whatsapp,
    email: data.email,
    photo: data.photo,
    address: {
      line: data.addressLine ? sanitizeText(data.addressLine) : undefined,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
    },
    aadhaar: data.aadhaar ? encryptSensitiveField(data.aadhaar) : undefined,
    pan: data.pan ? encryptSensitiveField(data.pan) : undefined,
    education: {
      college: data.college,
      course: data.course,
      year: data.year,
    },
    loan: {
      requested: data.loanRequested ?? 0,
      sanctioned: data.loanSanctioned ?? 0,
      disbursed: data.loanDisbursed ?? 0,
      interest: data.interest ?? 0,
      bankName: data.bankName,
      applicationNumber: data.applicationNumber,
    },
    partnerId: data.partnerId || undefined,
    status: data.status ?? "new",
    remarks: data.remarks ? sanitizeText(data.remarks) : undefined,
    timeline: [{ status: data.status ?? "new", createdByName: user?.name, createdAt: new Date() }],
    metadata: { createdBy: user?.id, createdByName: user?.name },
  });

  await Application.create({
    studentId: student._id,
    partnerId: data.partnerId || undefined,
    loanAmount: data.loanRequested ?? 0,
    status: data.status ?? "new",
    pipelineStage: data.status ?? "new",
    metadata: { createdBy: user?.id, createdByName: user?.name },
  });

  if (data.partnerId) {
    await Partner.findByIdAndUpdate(data.partnerId, {
      $inc: { studentsCount: 1, totalLoanValue: data.loanRequested ?? 0 },
    });
  }

  await logActivity({
    action: "student.created",
    description: `Student ${data.firstName} ${data.lastName} (${studentId}) was created`,
    resourceType: "student",
    resourceId: student._id.toString(),
    userId: user?.id,
    userName: user?.name,
  });

  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/overview");
  revalidateInsightCaches();
  return { success: true, data: { id: student._id.toString() } };
  });
}

export async function updateStudentAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  return runLoggedMutation("updateStudentAction", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

  const raw = Object.fromEntries(formData.entries());
  const parsed = studentSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  await connectDB();
  const data = parsed.data;
  const existing = await Student.findById(id);
  if (!existing) return { success: false, error: "Student not found" };

  const oldStatus = existing.status;
  existing.firstName = sanitizeText(data.firstName);
  existing.lastName = sanitizeText(data.lastName);
  existing.gender = data.gender;
  existing.dob = data.dob ? new Date(data.dob) : existing.dob;
  existing.phone = data.phone;
  existing.whatsapp = data.whatsapp;
  existing.email = data.email;
  if (data.photo) existing.photo = data.photo;
  existing.address = {
    line: data.addressLine ? sanitizeText(data.addressLine) : undefined,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
  };
  existing.aadhaar = encryptSensitiveField(data.aadhaar, existing.aadhaar) ?? existing.aadhaar;
  existing.pan = encryptSensitiveField(data.pan, existing.pan) ?? existing.pan;
  existing.education = { college: data.college, course: data.course, year: data.year };
  existing.loan = {
    requested: data.loanRequested ?? 0,
    sanctioned: data.loanSanctioned ?? 0,
    disbursed: data.loanDisbursed ?? 0,
    interest: data.interest ?? 0,
    bankName: data.bankName,
    applicationNumber: data.applicationNumber,
  };
  existing.partnerId = data.partnerId ? new Types.ObjectId(data.partnerId) : existing.partnerId;
  if (data.status) existing.status = data.status;
  existing.remarks = data.remarks ? sanitizeText(data.remarks) : existing.remarks;
  existing.metadata.updatedBy = user?.id ? new Types.ObjectId(user.id) : undefined;

  if (data.status && data.status !== oldStatus) {
    existing.timeline.push({
      status: data.status,
      note: `Status changed from ${oldStatus} to ${data.status}`,
      createdBy: user?.id ? new Types.ObjectId(user.id) : undefined,
      createdByName: user?.name,
      createdAt: new Date(),
    });
    await Application.updateMany(
      { studentId: existing._id },
      { status: data.status, pipelineStage: data.status }
    );
  }

  await existing.save();

  await logActivity({
    action: "student.updated",
    description: `Student ${existing.studentId} was updated`,
    resourceType: "student",
    resourceId: id,
    userId: user?.id,
    userName: user?.name,
  });

  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${id}`);
  return { success: true };
  });
}

export async function deleteStudentAction(id: string): Promise<ActionResult> {
  return runLoggedMutation("deleteStudentAction", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.STUDENTS_DELETE);

  await connectDB();
  const student = await Student.findByIdAndDelete(id);
  if (!student) return { success: false, error: "Student not found" };

  await Application.deleteMany({ studentId: id });

  await logActivity({
    action: "student.deleted",
    description: `Student ${student.studentId} was deleted`,
    resourceType: "student",
    resourceId: id,
    userId: user?.id,
    userName: user?.name,
  });

  revalidatePath("/dashboard/students");
  return { success: true };
  });
}

export async function bulkUpdateStudentsAction(
  ids: string[],
  action: "delete" | "assign_partner" | "change_status",
  value?: string
): Promise<ActionResult> {
  return runLoggedMutation("bulkUpdateStudentsAction", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

  await connectDB();

  if (action === "delete") {
    requirePermission(user, PERMISSIONS.STUDENTS_DELETE);
    await Student.deleteMany({ _id: { $in: ids } });
    await Application.deleteMany({ studentId: { $in: ids } });
  } else if (action === "assign_partner" && value) {
    await Student.updateMany(
      { _id: { $in: ids } },
      { partnerId: new Types.ObjectId(value) }
    );
  } else if (action === "change_status" && value) {
    await Student.updateMany({ _id: { $in: ids } }, { status: value });
    await Application.updateMany(
      { studentId: { $in: ids } },
      { status: value, pipelineStage: value }
    );
  }

  revalidatePath("/dashboard/students");
  return { success: true };
  });
}

export async function addStudentNoteAction(
  studentId: string,
  formData: FormData
): Promise<ActionResult> {
  return runLoggedMutation("addStudentNoteAction", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

  const parsed = noteSchema.safeParse({
    content: formData.get("content"),
    dueDate: formData.get("dueDate"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  await connectDB();
  await Student.findByIdAndUpdate(studentId, {
    $push: {
      notes: {
        content: sanitizeText(parsed.data.content),
        createdBy: user?.id,
        createdByName: user?.name,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
        createdAt: new Date(),
      },
    },
  });

  revalidatePath(`/dashboard/students/${studentId}`);
  return { success: true };
  });
}

export async function addStudentDocumentAction(
  studentId: string,
  doc: { name: string; url: string; publicId: string; mimeType: string }
): Promise<ActionResult> {
  return runLoggedMutation("addStudentDocumentAction", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

  const validation = validateCloudinaryDocument(doc.url, doc.publicId, "students");
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  await connectDB();
  await Student.findByIdAndUpdate(studentId, {
    $push: {
      documents: {
        ...doc,
        uploadedBy: user?.id,
        uploadedAt: new Date(),
      },
    },
  });

  revalidatePath(`/dashboard/students/${studentId}`);
  return { success: true };
  });
}

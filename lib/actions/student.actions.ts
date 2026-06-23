"use server";

import { revalidatePath } from "next/cache";
import { revalidateInsightCaches } from "@/lib/cache/revalidate";
import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { Partner } from "@/models/Partner";
import { Application } from "@/models/Application";
import { User } from "@/models/User";
import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { logActivity } from "@/lib/services/activity.service";
import { studentSchema, noteSchema } from "@/lib/validations/schemas";
import { sanitizeText, toSafeRegExp } from "@/lib/utils/sanitize";
import {
  formatAadhaarForEdit,
  normalizeAadhaar,
  normalizeIndianPhone,
  normalizePan,
  normalizePincode,
} from "@/lib/validations/indian-fields";
import { encryptSensitiveField, maskAadhaar, maskPan, safeDecrypt } from "@/lib/utils/pii";
import { allocateStudentId } from "@/lib/services/student-id.service";
import type { ActionResult, PaginatedResult, StudentListItem } from "@/types";
import type { StudentStatus } from "@/lib/constants/statuses";
import { Types } from "mongoose";
import {
  getDocumentUrlError,
  getOptionalLinkUrlError,
  normalizeDocumentUrl,
  normalizeOptionalLinkUrl,
} from "@/lib/utils/document-url";
import { runLoggedMutation, runLoggedQuery, emptyPaginated } from "@/lib/action-utils";
import { getStatusesForLoanStage } from "@/lib/constants/student-loan-stages";
import { isStudentProfileVerified } from "@/lib/utils/student-profile";
import { endOfDay, startOfDay } from "date-fns";

function resolveAssignedTo(
  assignedToId: string | undefined,
  existingAssignedTo?: Types.ObjectId,
  existingAssignedAt?: Date
): { assignedTo?: Types.ObjectId; assignedAt?: Date } {
  if (assignedToId === "") {
    return { assignedTo: undefined, assignedAt: undefined };
  }
  if (assignedToId) {
    return { assignedTo: new Types.ObjectId(assignedToId), assignedAt: new Date() };
  }
  return {
    assignedTo: existingAssignedTo,
    assignedAt: existingAssignedAt,
  };
}

export async function getAssignableUsers() {
  return runLoggedQuery("getAssignableUsers", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_READ);

    await connectDB();
    const users = await User.find({ status: "active" })
      .select("name email role")
      .sort({ name: 1 })
      .lean();

    return users.map((entry) => ({
      _id: entry._id.toString(),
      name: entry.name,
      email: entry.email,
      role: entry.role,
    }));
  }, []);
}

export async function getStudents(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  stage?: string;
  partnerId?: string;
  assignedToId?: string;
  targetCountry?: string;
  targetIntake?: string;
  dateFrom?: string;
  dateTo?: string;
  loanMin?: number;
  loanMax?: number;
  state?: string;
  college?: string;
  course?: string;
  bank?: string;
  mine?: boolean;
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
  if (params.status) {
    filter.status = params.status;
  } else {
    const stageStatuses = getStatusesForLoanStage(params.stage);
    if (stageStatuses?.length) {
      filter.status = { $in: stageStatuses };
    }
  }
  if (params.partnerId) filter.partnerId = new Types.ObjectId(params.partnerId);
  if (params.assignedToId) filter.assignedTo = new Types.ObjectId(params.assignedToId);
  if (params.targetCountry) filter.targetCountry = params.targetCountry;
  if (params.targetIntake) filter.targetIntake = params.targetIntake;
  if (params.state) filter["address.state"] = toSafeRegExp(params.state);
  if (params.college) filter["education.college"] = toSafeRegExp(params.college);
  if (params.course) filter["education.course"] = toSafeRegExp(params.course);
  if (params.bank) filter["loan.bankName"] = toSafeRegExp(params.bank);
  if (params.dateFrom || params.dateTo) {
    const createdAt: Record<string, Date> = {};
    if (params.dateFrom) {
      const parsed = new Date(params.dateFrom);
      if (!Number.isNaN(parsed.getTime())) {
        createdAt.$gte = startOfDay(parsed);
      }
    }
    if (params.dateTo) {
      const parsed = new Date(params.dateTo);
      if (!Number.isNaN(parsed.getTime())) {
        createdAt.$lte = endOfDay(parsed);
      }
    }
    if (Object.keys(createdAt).length) filter.createdAt = createdAt;
  }
  if (params.loanMin != null || params.loanMax != null) {
    const loanRequested: Record<string, number> = {};
    if (params.loanMin != null && !Number.isNaN(params.loanMin)) {
      loanRequested.$gte = params.loanMin;
    }
    if (params.loanMax != null && !Number.isNaN(params.loanMax)) {
      loanRequested.$lte = params.loanMax;
    }
    if (Object.keys(loanRequested).length) filter["loan.requested"] = loanRequested;
  }
  if (params.mine && user?.id) {
    filter.assignedTo = new Types.ObjectId(user.id);
  }

  const [data, total] = await Promise.all([
    Student.find(filter)
      .populate("partnerId", "companyName")
      .populate("assignedTo", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Student.countDocuments(filter),
  ]);

  return {
    data: data.map((s) => {
      const documents = (s.documents ?? []).map((doc) => ({ name: doc.name }));
      const profileInput = {
        phone: s.phone,
        whatsapp: s.whatsapp,
        email: s.email,
        gender: s.gender,
        dob: s.dob,
        targetCountry: s.targetCountry,
        targetIntake: s.targetIntake,
        targetDegree: s.targetDegree,
        address: s.address,
        education: s.education,
        loan: s.loan,
        partnerId: s.partnerId,
        partnerName: (s.partnerId as { companyName?: string } | null)?.companyName,
        hasAadhaar: Boolean(s.aadhaar),
        hasPan: Boolean(s.pan),
        documents,
      };

      return {
        _id: s._id.toString(),
        studentId: s.studentId,
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        whatsapp: s.whatsapp,
        email: s.email,
        status: s.status as StudentStatus,
        partnerName: (s.partnerId as { companyName?: string } | null)?.companyName,
        assigneeName: (s.assignedTo as { name?: string } | null)?.name,
        targetCountry: s.targetCountry,
        targetIntake: s.targetIntake,
        targetDegree: s.targetDegree,
        loanRequested: s.loan?.requested,
        profileVerified: isStudentProfileVerified(profileInput, documents),
        documentsCount: documents.length,
        createdAt: s.createdAt,
      };
    }),
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
  const student = await Student.findById(id)
    .populate("partnerId")
    .populate("assignedTo", "name email")
    .lean();
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
    aadhaar: formatAadhaarForEdit(safeDecrypt(student.aadhaar)),
    pan: normalizePan(safeDecrypt(student.pan)),
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

  const photoError = getOptionalLinkUrlError(data.photo);
  if (photoError) {
    return { success: false, error: `Photo link: ${photoError}` };
  }

  const studentId = await allocateStudentId();

  const student = await Student.create({
    studentId,
    firstName: sanitizeText(data.firstName),
    lastName: sanitizeText(data.lastName),
    gender: data.gender,
    dob: data.dob ? new Date(data.dob) : undefined,
    phone: data.phone?.trim() ? normalizeIndianPhone(data.phone) : undefined,
    whatsapp: data.whatsapp?.trim() ? normalizeIndianPhone(data.whatsapp) : undefined,
    email: data.email,
    photo: normalizeOptionalLinkUrl(data.photo),
    address: {
      line: data.addressLine ? sanitizeText(data.addressLine) : undefined,
      city: data.city,
      state: data.state,
      pincode: data.pincode?.trim() ? normalizePincode(data.pincode) : undefined,
    },
    aadhaar: data.aadhaar?.trim()
      ? encryptSensitiveField(normalizeAadhaar(data.aadhaar))
      : undefined,
    pan: data.pan?.trim() ? encryptSensitiveField(normalizePan(data.pan)) : undefined,
    education: {
      college: data.college,
      course: data.course,
      year: data.year,
    },
    loan: {
      requested: data.loanRequested ?? 0,
      sanctioned: data.loanSanctioned ?? 0,
      disbursed: data.loanDisbursed ?? 0,
      disbursedAt: (data.loanDisbursed ?? 0) > 0 ? new Date() : undefined,
      interest: data.interest ?? 0,
      bankName: data.bankName,
      applicationNumber: data.applicationNumber,
    },
    partnerId: data.partnerId || undefined,
    ...resolveAssignedTo(data.assignedToId),
    targetCountry: data.targetCountry?.trim() || undefined,
    targetIntake: data.targetIntake?.trim() || undefined,
    targetDegree: data.targetDegree?.trim() || undefined,
    commissionPercentOverride:
      data.commissionPercentOverride === "" || data.commissionPercentOverride == null
        ? undefined
        : data.commissionPercentOverride,
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

  const photoError = getOptionalLinkUrlError(data.photo);
  if (photoError) {
    return { success: false, error: `Photo link: ${photoError}` };
  }

  const oldStatus = existing.status;
  existing.firstName = sanitizeText(data.firstName);
  existing.lastName = sanitizeText(data.lastName);
  existing.gender = data.gender;
  existing.dob = data.dob ? new Date(data.dob) : existing.dob;
  existing.phone = data.phone?.trim() ? normalizeIndianPhone(data.phone) : undefined;
  existing.whatsapp = data.whatsapp?.trim() ? normalizeIndianPhone(data.whatsapp) : undefined;
  existing.email = data.email;
  if (data.photo) existing.photo = normalizeOptionalLinkUrl(data.photo);
  else if (raw.photo === "") existing.photo = undefined;
  existing.address = {
    line: data.addressLine ? sanitizeText(data.addressLine) : undefined,
    city: data.city,
    state: data.state,
    pincode: data.pincode?.trim() ? normalizePincode(data.pincode) : undefined,
  };
  if (data.aadhaar?.trim()) {
    existing.aadhaar = encryptSensitiveField(normalizeAadhaar(data.aadhaar));
  } else if (raw.aadhaar === "") {
    existing.aadhaar = undefined;
  }
  if (data.pan?.trim()) {
    existing.pan = encryptSensitiveField(normalizePan(data.pan));
  } else if (raw.pan === "") {
    existing.pan = undefined;
  }
  existing.education = { college: data.college, course: data.course, year: data.year };
  const nextDisbursed = data.loanDisbursed ?? 0;
  const previousDisbursed = existing.loan?.disbursed ?? 0;
  existing.loan = {
    requested: data.loanRequested ?? 0,
    sanctioned: data.loanSanctioned ?? 0,
    disbursed: nextDisbursed,
    disbursedAt:
      nextDisbursed > 0
        ? existing.loan?.disbursedAt ?? new Date()
        : undefined,
    interest: data.interest ?? 0,
    bankName: data.bankName,
    applicationNumber: data.applicationNumber,
  };
  if (nextDisbursed > 0 && previousDisbursed === 0 && !existing.loan.disbursedAt) {
    existing.loan.disbursedAt = new Date();
  }
  if (data.commissionPercentOverride === "" || data.commissionPercentOverride == null) {
    existing.commissionPercentOverride = undefined;
  } else {
    existing.commissionPercentOverride = data.commissionPercentOverride;
  }
  const assignment = resolveAssignedTo(
    data.assignedToId,
    existing.assignedTo,
    existing.assignedAt
  );
  existing.assignedTo = assignment.assignedTo;
  existing.assignedAt = assignment.assignedAt;
  existing.targetCountry = data.targetCountry?.trim() || undefined;
  existing.targetIntake = data.targetIntake?.trim() || undefined;
  existing.targetDegree = data.targetDegree?.trim() || undefined;
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
  doc: { name: string; url: string }
): Promise<ActionResult> {
  return runLoggedMutation("addStudentDocumentAction", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

  const name = sanitizeText(doc.name);
  if (!name) {
    return { success: false, error: "Document name is required" };
  }

  const url = normalizeDocumentUrl(doc.url);
  const urlError = getDocumentUrlError(url);
  if (urlError) {
    return { success: false, error: urlError };
  }

  await connectDB();
  await Student.findByIdAndUpdate(studentId, {
    $push: {
      documents: {
        name,
        url,
        uploadedBy: user?.id,
        uploadedAt: new Date(),
      },
    },
  });

  revalidatePath(`/dashboard/students/${studentId}`);
  return { success: true };
  });
}

export async function removeStudentDocumentAction(
  studentId: string,
  documentId: string
): Promise<ActionResult> {
  return runLoggedMutation("removeStudentDocumentAction", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

  await connectDB();
  const result = await Student.findByIdAndUpdate(
    studentId,
    { $pull: { documents: { _id: new Types.ObjectId(documentId) } } },
    { new: true }
  );

  if (!result) {
    return { success: false, error: "Student not found" };
  }

  revalidatePath(`/dashboard/students/${studentId}`);
  return { success: true };
  });
}

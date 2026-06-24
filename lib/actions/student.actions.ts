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
import { studentSchema, noteSchema, leadSchema } from "@/lib/validations/schemas";
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
import { buildWorkflowMongoFilter } from "@/lib/constants/student-workflow-filters";
import {
  applyApplicationStatus,
  deriveApplicationStatus,
  getApplicationStatusLabel,
  type ApplicationStatusId,
} from "@/lib/constants/application-status";
import { isStudentProfileVerified } from "@/lib/utils/student-profile";
import { resolveLenderIdBySlug, resolveLenderNameBySlug, getLenderSlugById } from "@/lib/services/lender.service";
import {
  addStudentLoanApplication,
  buildInitialLoanApplications,
  ensureStudentLoanApplications,
  rejectLoanApplication,
  sendLoanApplicationToBank,
  setStudentPrimaryLender,
  syncPrimaryLoanApplicationFromStudentEdit,
  updateLoanApplicationStatus,
  toSessionUser,
} from "@/lib/services/loan-application.service";
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

async function buildLoanFields(
  data: {
    loanRequested?: number;
    loanSanctioned?: number;
    loanDisbursed?: number;
    interest?: number;
    bankName?: string;
    applicationNumber?: string;
    loanCurrency?: "INR" | "USD";
    lenderId?: string;
    roi?: number;
    processingFee?: number;
  },
  existing?: {
    disbursedAt?: Date;
    disbursed?: number;
  },
  pfPaidOverride?: boolean
) {
  const nextDisbursed = data.loanDisbursed ?? 0;
  const lenderObjectId = await resolveLenderIdBySlug(data.lenderId);
  const lenderName = await resolveLenderNameBySlug(data.lenderId);

  return {
    requested: data.loanRequested ?? 0,
    sanctioned: data.loanSanctioned ?? 0,
    disbursed: nextDisbursed,
    disbursedAt:
      nextDisbursed > 0
        ? existing?.disbursedAt ?? new Date()
        : undefined,
    currency: data.loanCurrency ?? "INR",
    lenderId: lenderObjectId,
    roi: data.roi ?? 0,
    interest: data.interest ?? 0,
    processingFee: data.processingFee ?? 0,
    pfPaid: pfPaidOverride ?? false,
    bankName: lenderName,
    applicationNumber: data.applicationNumber,
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
  workflow?: string;
  lenderId?: string;
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
  gender?: string;
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
    const workflowFilter = buildWorkflowMongoFilter(params.workflow);
    if (workflowFilter) {
      Object.assign(filter, workflowFilter);
    }
  }
  if (params.lenderId) {
    const resolvedLenderId = await resolveLenderIdBySlug(params.lenderId);
    if (resolvedLenderId) {
      filter["loan.lenderId"] = resolvedLenderId;
    }
  }
  if (params.partnerId) filter.partnerId = new Types.ObjectId(params.partnerId);
  if (params.assignedToId) filter.assignedTo = new Types.ObjectId(params.assignedToId);
  if (params.targetCountry) filter.targetCountry = params.targetCountry;
  if (params.targetIntake) filter.targetIntake = params.targetIntake;
  if (params.state) filter["address.state"] = toSafeRegExp(params.state);
  if (params.college) filter["education.college"] = toSafeRegExp(params.college);
  if (params.course) filter["education.course"] = toSafeRegExp(params.course);
  if (params.gender) filter.gender = params.gender;
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
      const profileInput = {
        phone: s.phone,
        whatsapp: s.whatsapp,
        email: s.email,
        gender: s.gender,
        dob: s.dob,
        targetCountry: s.targetCountry,
        targetIntake: s.targetIntake,
        targetDegree: s.targetDegree,
        targetUniversity: s.targetUniversity,
        address: s.address,
        education: s.education,
        loan: s.loan,
        partnerId: s.partnerId,
        partnerName: (s.partnerId as { companyName?: string } | null)?.companyName,
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
        profileVerified: isStudentProfileVerified(profileInput),
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
  const studentDoc = await Student.findById(id)
    .populate("partnerId")
    .populate("assignedTo", "name email")
    .populate("loan.lenderId", "name slug")
    .populate("loanApplications.lenderId", "name slug");

  if (!studentDoc) return null;

  const { ensureStudentLoanApplications } = await import("@/lib/services/loan-application.service");
  await ensureStudentLoanApplications(studentDoc);

  const student = await Student.findById(id)
    .populate("partnerId")
    .populate("assignedTo", "name email")
    .populate("loan.lenderId", "name slug")
    .populate("loanApplications.lenderId", "name slug")
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
  const student = await Student.findById(id)
    .populate("loan.lenderId", "slug")
    .populate("assignedTo", "name")
    .lean();
  if (!student) return null;

  const lenderSlug = await getLenderSlugById(student.loan?.lenderId as Types.ObjectId | undefined);

  return {
    ...student,
    aadhaar: formatAadhaarForEdit(safeDecrypt(student.aadhaar)),
    pan: normalizePan(safeDecrypt(student.pan)),
    lenderId: lenderSlug,
    loanCurrency: student.loan?.currency,
    roi: student.loan?.roi,
    processingFee: student.loan?.processingFee,
    pfPaid: student.loan?.pfPaid,
    targetUniversity: student.targetUniversity,
    admissionRevenue: student.admissionRevenue,
    loggedIn: student.loggedIn,
    applicationStatus: deriveApplicationStatus(student),
    sentToBank: student.sentToBank,
    sentToBankAt: student.sentToBankAt,
    sentToBankByName: student.sentToBankByName,
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
  const applicationStatus = (data.applicationStatus ?? "docs_pending") as ApplicationStatusId;
  const appFields = applyApplicationStatus(applicationStatus);
  const loan = await buildLoanFields(data, undefined, appFields.pfPaid);
  const sessionUser = toSessionUser(user);

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
    loan,
    loanApplications: buildInitialLoanApplications(loan, appFields.applicationStatus, sessionUser),
    partnerId: data.partnerId || undefined,
    ...resolveAssignedTo(data.assignedToId),
    targetCountry: data.targetCountry?.trim() || undefined,
    targetIntake: data.targetIntake?.trim() || undefined,
    targetDegree: data.targetDegree?.trim() || undefined,
    targetUniversity: data.targetUniversity?.trim() || undefined,
    admissionRevenue: data.admissionRevenue ?? 0,
    applicationStatus: appFields.applicationStatus,
    loggedIn: appFields.loggedIn,
    commissionPercentOverride:
      data.commissionPercentOverride === "" || data.commissionPercentOverride == null
        ? undefined
        : data.commissionPercentOverride,
    status: appFields.status,
    remarks: data.remarks ? sanitizeText(data.remarks) : undefined,
    timeline: [{ status: appFields.status, note: `Application status: ${getApplicationStatusLabel(appFields.applicationStatus)}`, createdByName: user?.name, createdAt: new Date() }],
    metadata: { createdBy: user?.id, createdByName: user?.name },
  });

  await Application.create({
    studentId: student._id,
    partnerId: data.partnerId || undefined,
    loanAmount: data.loanRequested ?? 0,
    status: appFields.status,
    pipelineStage: appFields.status,
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

export async function createLeadAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  return runLoggedMutation("createLeadAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

    const raw = Object.fromEntries(formData.entries());
    const parsed = leadSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
    }

    await connectDB();
    const data = parsed.data;
    const studentId = await allocateStudentId();
    const lenderObjectId = await resolveLenderIdBySlug(data.lenderId);
    const lenderName = await resolveLenderNameBySlug(data.lenderId);

    const student = await Student.create({
      studentId,
      firstName: sanitizeText(data.firstName),
      lastName: sanitizeText(data.lastName),
      phone: data.phone?.trim() ? normalizeIndianPhone(data.phone) : undefined,
      targetCountry: data.targetCountry?.trim() || undefined,
      targetIntake: data.targetIntake?.trim() || undefined,
      targetUniversity: data.targetUniversity?.trim() || undefined,
      admissionRevenue: data.admissionRevenue ?? 0,
      recordType: "lead",
      applicationStatus: "docs_pending",
      loggedIn: false,
      loan: {
        requested: 0,
        lenderId: lenderObjectId,
        bankName: lenderName,
      },
      loanApplications: buildInitialLoanApplications(
        { lenderId: lenderObjectId },
        "docs_pending",
        toSessionUser(user)
      ),
      ...resolveAssignedTo(data.assignedToId),
      status: "new",
      timeline: [{ status: "new", createdByName: user?.name, createdAt: new Date() }],
      metadata: { createdBy: user?.id, createdByName: user?.name },
    });

    await Application.create({
      studentId: student._id,
      loanAmount: 0,
      status: "new",
      pipelineStage: "new",
      metadata: { createdBy: user?.id, createdByName: user?.name },
    });

    await logActivity({
      action: "student.created",
      description: `Lead ${data.firstName} ${data.lastName} (${studentId}) was created`,
      resourceType: "student",
      resourceId: student._id.toString(),
      userId: user?.id,
      userName: user?.name,
    });

    revalidatePath("/dashboard/students");
    revalidatePath("/dashboard/admissions");
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

  await ensureStudentLoanApplications(existing);

  const previousLenderId = existing.loan?.lenderId;
  const previousApplicationStatus = deriveApplicationStatus(existing);
  const previousApplicationNumber = existing.loan?.applicationNumber;

  const photoError = getOptionalLinkUrlError(data.photo);
  if (photoError) {
    return { success: false, error: `Photo link: ${photoError}` };
  }

  const oldStatus = existing.status;
  const oldApplicationStatus = deriveApplicationStatus(existing);
  const applicationStatus = (data.applicationStatus ?? oldApplicationStatus) as ApplicationStatusId;
  const appFields = applyApplicationStatus(applicationStatus);
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
  existing.loan = await buildLoanFields(data, {
    disbursed: existing.loan?.disbursed,
    disbursedAt: existing.loan?.disbursedAt,
  }, appFields.pfPaid);
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
  existing.targetUniversity = data.targetUniversity?.trim() || undefined;
  existing.admissionRevenue = data.admissionRevenue ?? existing.admissionRevenue ?? 0;
  existing.applicationStatus = appFields.applicationStatus;
  existing.loggedIn = appFields.loggedIn;
  existing.partnerId = data.partnerId ? new Types.ObjectId(data.partnerId) : existing.partnerId;
  existing.status = appFields.status;
  existing.remarks = data.remarks ? sanitizeText(data.remarks) : existing.remarks;
  existing.metadata.updatedBy = user?.id ? new Types.ObjectId(user.id) : undefined;

  if (appFields.status !== oldStatus || appFields.applicationStatus !== oldApplicationStatus) {
    existing.timeline.push({
      status: appFields.status,
      note: `Application status changed to ${getApplicationStatusLabel(appFields.applicationStatus)}`,
      createdBy: user?.id ? new Types.ObjectId(user.id) : undefined,
      createdByName: user?.name,
      createdAt: new Date(),
    });
    await Application.updateMany(
      { studentId: existing._id },
      { status: appFields.status, pipelineStage: appFields.status }
    );
  }

  await syncPrimaryLoanApplicationFromStudentEdit(existing, {
    previousLenderId,
    previousApplicationStatus,
    previousApplicationNumber,
    user: toSessionUser(user),
  });

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
  revalidatePath("/dashboard/admissions");
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

export async function updateStudentApplicationStatusAction(
  studentId: string,
  applicationStatus: ApplicationStatusId
): Promise<ActionResult> {
  return runLoggedMutation("updateStudentApplicationStatusAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

    await connectDB();
    const student = await Student.findById(studentId);
    if (!student) return { success: false, error: "Student not found" };

    const oldStatus = student.status;
    const oldApplicationStatus = deriveApplicationStatus(student);
    const appFields = applyApplicationStatus(applicationStatus);

    student.applicationStatus = appFields.applicationStatus;
    student.status = appFields.status;
    student.loggedIn = appFields.loggedIn;
    if (!student.loan) student.loan = { requested: 0, sanctioned: 0, disbursed: 0 };
    student.loan.pfPaid = appFields.pfPaid;

    if (appFields.status !== oldStatus || appFields.applicationStatus !== oldApplicationStatus) {
      student.timeline.push({
        status: appFields.status,
        note: `Application status changed to ${getApplicationStatusLabel(appFields.applicationStatus)}`,
        createdBy: user?.id ? new Types.ObjectId(user.id) : undefined,
        createdByName: user?.name,
        createdAt: new Date(),
      });
      await Application.updateMany(
        { studentId: student._id },
        { status: appFields.status, pipelineStage: appFields.status }
      );
    }

    await student.save();

    await logActivity({
      action: "student.application_status_updated",
      description: `Application status for ${student.studentId} set to ${getApplicationStatusLabel(appFields.applicationStatus)}`,
      resourceType: "student",
      resourceId: studentId,
      userId: user?.id,
      userName: user?.name,
    });

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: true };
  });
}

export async function markStudentSentToBankAction(
  studentId: string
): Promise<ActionResult<{ sentToBank: true; sentToBankAt: string; sentToBankByName?: string }>> {
  return runLoggedMutation("markStudentSentToBankAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

    await connectDB();
    const student = await Student.findById(studentId).populate("loanApplications.lenderId", "name slug");
    if (!student) return { success: false, error: "Student not found" };

    await ensureStudentLoanApplications(student);

    const primary =
      student.loanApplications?.find((entry) => entry.isPrimary) ?? student.loanApplications?.[0];
    if (!primary?._id) {
      return { success: false, error: "Assign a lender before sending to bank" };
    }

    const result = await sendLoanApplicationToBank(student, primary._id.toString(), toSessionUser(user));

    await logActivity({
      action: "student.sent_to_bank",
      description: `Student ${student.studentId} marked as sent to bank`,
      resourceType: "student",
      resourceId: studentId,
      userId: user?.id,
      userName: user?.name,
    });

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${studentId}`);
    return {
      success: true,
      data: {
        sentToBank: true,
        sentToBankAt: result.sentToBankAt.toISOString(),
        sentToBankByName: result.sentToBankByName,
      },
    };
  });
}

export async function setStudentPrimaryLenderAction(
  studentId: string,
  lenderSlug: string
): Promise<ActionResult> {
  return runLoggedMutation("setStudentPrimaryLenderAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

    await connectDB();
    const student = await Student.findById(studentId);
    if (!student) return { success: false, error: "Student not found" };

    await ensureStudentLoanApplications(student);
    await setStudentPrimaryLender(student, lenderSlug, toSessionUser(user));

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: true };
  });
}

export async function addStudentLoanApplicationAction(
  studentId: string,
  lenderSlug: string
): Promise<ActionResult> {
  return runLoggedMutation("addStudentLoanApplicationAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

    await connectDB();
    const student = await Student.findById(studentId);
    if (!student) return { success: false, error: "Student not found" };

    await ensureStudentLoanApplications(student);
    try {
      await addStudentLoanApplication(student, lenderSlug, toSessionUser(user));
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to add bank application",
      };
    }

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: true };
  });
}

export async function sendLoanApplicationToBankAction(
  studentId: string,
  applicationId: string
): Promise<ActionResult<{ sentToBankAt: string; sentToBankByName?: string; lenderName?: string }>> {
  return runLoggedMutation("sendLoanApplicationToBankAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

    await connectDB();
    const student = await Student.findById(studentId).populate("loanApplications.lenderId", "name slug");
    if (!student) return { success: false, error: "Student not found" };

    await ensureStudentLoanApplications(student);

    try {
      const result = await sendLoanApplicationToBank(student, applicationId, toSessionUser(user));
      revalidatePath("/dashboard/students");
      revalidatePath(`/dashboard/students/${studentId}`);
      return {
        success: true,
        data: {
          sentToBankAt: result.sentToBankAt.toISOString(),
          sentToBankByName: result.sentToBankByName,
          lenderName: result.lenderName,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send application to bank",
      };
    }
  });
}

export async function updateLoanApplicationStatusAction(
  studentId: string,
  applicationId: string,
  applicationStatus: ApplicationStatusId
): Promise<ActionResult> {
  return runLoggedMutation("updateLoanApplicationStatusAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

    await connectDB();
    const student = await Student.findById(studentId);
    if (!student) return { success: false, error: "Student not found" };

    await ensureStudentLoanApplications(student);

    try {
      await updateLoanApplicationStatus(student, applicationId, applicationStatus, toSessionUser(user));
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update application status",
      };
    }

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: true };
  });
}

export async function rejectLoanApplicationAction(
  studentId: string,
  applicationId: string,
  rejectionNote?: string
): Promise<ActionResult> {
  return runLoggedMutation("rejectLoanApplicationAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

    await connectDB();
    const student = await Student.findById(studentId);
    if (!student) return { success: false, error: "Student not found" };

    await ensureStudentLoanApplications(student);

    try {
      await rejectLoanApplication(student, applicationId, toSessionUser(user), rejectionNote);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to record rejection",
      };
    }

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: true };
  });
}

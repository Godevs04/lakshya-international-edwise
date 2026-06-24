import { Types } from "mongoose";
import { Student, type IStudent } from "@/models/Student";
import {
  applyApplicationStatus,
  deriveApplicationStatus,
  getApplicationStatusLabel,
  type ApplicationStatusId,
} from "@/lib/constants/application-status";
import type { LoanApplicationHistoryAction } from "@/lib/constants/loan-application";
import { getLenderSlugById, resolveLenderIdBySlug, resolveLenderNameBySlug } from "@/lib/services/lender.service";
import { formatDateTime } from "@/lib/utils/format";

interface SessionUser {
  id?: string;
  name?: string;
}

export function toSessionUser(user: { id: string; name: string } | null | undefined): SessionUser | undefined {
  if (!user) return undefined;
  return { id: user.id, name: user.name };
}

type StudentDoc = IStudent & { _id: Types.ObjectId };

function getPrimaryApplication(student: StudentDoc) {
  return student.loanApplications?.find((entry) => entry.isPrimary) ?? student.loanApplications?.[0];
}

export function syncGlobalSentToBank(student: StudentDoc) {
  const sentApps = (student.loanApplications ?? []).filter((entry) => entry.sentToBank);
  if (sentApps.length === 0) {
    student.sentToBank = false;
    student.sentToBankAt = undefined;
    student.sentToBankByName = undefined;
    return;
  }

  const latest = [...sentApps].sort((a, b) => {
    const aTime = a.sentToBankAt ? new Date(a.sentToBankAt).getTime() : 0;
    const bTime = b.sentToBankAt ? new Date(b.sentToBankAt).getTime() : 0;
    return bTime - aTime;
  })[0];

  student.sentToBank = true;
  student.sentToBankAt = latest.sentToBankAt;
  student.sentToBankByName = latest.sentToBankByName;
}

function findLoanApplication(student: StudentDoc, applicationId: Types.ObjectId | string) {
  const targetId = applicationId.toString();
  return student.loanApplications?.find((entry) => entry._id?.toString() === targetId);
}

function pushApplicationHistory(
  student: StudentDoc,
  applicationId: Types.ObjectId | string,
  action: LoanApplicationHistoryAction,
  user?: SessionUser,
  extra?: { status?: string; note?: string }
) {
  const app = findLoanApplication(student, applicationId);
  if (!app) return;

  if (!app.history) app.history = [];
  app.history.push({
    action,
    status: extra?.status,
    note: extra?.note,
    createdBy: user?.id ? new Types.ObjectId(user.id) : undefined,
    createdByName: user?.name,
    createdAt: new Date(),
  });
}

export function appendLoanApplicationNote(
  student: StudentDoc,
  content: string,
  user?: SessionUser
) {
  if (!student.notes) student.notes = [];
  student.notes.push({
    content,
    createdBy: user?.id ? new Types.ObjectId(user.id) : undefined,
    createdByName: user?.name,
    createdAt: new Date(),
  });
}

function ensureStudentLoanApplicationsInMemory(student: StudentDoc) {
  if ((student.loanApplications?.length ?? 0) > 0) {
    return;
  }

  const lenderId = student.loan?.lenderId;
  if (!lenderId) {
    return;
  }

  const applicationStatus = deriveApplicationStatus(student);
  const history: StudentDoc["loanApplications"][number]["history"] = [];
  if (student.sentToBank) {
    history.push({
      action: "sent_to_bank",
      note: "Migrated from legacy send-to-bank record",
      createdByName: student.sentToBankByName,
      createdAt: student.sentToBankAt ?? new Date(),
    });
  }

  student.loanApplications = [
    {
      lenderId,
      applicationStatus,
      applicationNumber: student.loan?.applicationNumber,
      sentToBank: Boolean(student.sentToBank),
      sentToBankAt: student.sentToBankAt,
      sentToBankByName: student.sentToBankByName,
      isPrimary: true,
      history,
    },
  ];
}

export function buildInitialLoanApplications(
  loan: { lenderId?: Types.ObjectId; applicationNumber?: string },
  applicationStatus: ApplicationStatusId,
  user?: SessionUser
): IStudent["loanApplications"] {
  if (!loan.lenderId) {
    return [];
  }

  return [
    {
      lenderId: loan.lenderId,
      applicationStatus,
      applicationNumber: loan.applicationNumber,
      sentToBank: false,
      isPrimary: true,
      history: [
        {
          action: "added",
          note: "Created from student profile",
          createdBy: user?.id ? new Types.ObjectId(user.id) : undefined,
          createdByName: user?.name,
          createdAt: new Date(),
        },
      ],
    },
  ];
}

export async function syncPrimaryLoanApplicationFromStudentEdit(
  student: StudentDoc,
  options: {
    previousLenderId?: Types.ObjectId;
    previousApplicationStatus?: ApplicationStatusId;
    previousApplicationNumber?: string;
    user?: SessionUser;
  }
) {
  ensureStudentLoanApplicationsInMemory(student);

  const newLenderId = student.loan?.lenderId;
  if (!newLenderId) {
    return;
  }

  let primary = getPrimaryApplication(student);
  if (!primary) {
    student.loanApplications = buildInitialLoanApplications(
      {
        lenderId: newLenderId,
        applicationNumber: student.loan?.applicationNumber,
      },
      (student.applicationStatus ?? deriveApplicationStatus(student)) as ApplicationStatusId,
      options.user
    );
    return;
  }

  const lenderChanged =
    options.previousLenderId?.toString() !== newLenderId.toString();
  if (lenderChanged) {
    const existing = findApplicationByLenderId(student, newLenderId);
    if (existing) {
      for (const entry of student.loanApplications ?? []) {
        entry.isPrimary = entry._id?.toString() === existing._id?.toString();
      }
      primary = existing;
      pushApplicationHistory(student, existing._id!, "lender_changed", options.user, {
        note: "Primary lender updated from student profile",
      });
    } else {
      primary.lenderId = newLenderId;
      pushApplicationHistory(student, primary._id!, "lender_changed", options.user, {
        note: "Primary lender updated from student profile",
      });
    }

    const lenderName =
      (await resolveLenderNameBySlug(await getLenderSlugById(newLenderId))) ??
      student.loan?.bankName ??
      "the lender";
    appendLoanApplicationNote(
      student,
      `${options.user?.name ?? "Team"} changed primary lender to ${lenderName} from student profile on ${formatDateTime(new Date())}.`,
      options.user
    );
  }

  const newStatus = (student.applicationStatus ?? deriveApplicationStatus(student)) as ApplicationStatusId;
  if (primary.applicationStatus !== newStatus) {
    const oldStatus = primary.applicationStatus;
    primary.applicationStatus = newStatus;
    if (options.previousApplicationStatus !== newStatus) {
      pushApplicationHistory(student, primary._id!, "status_updated", options.user, {
        status: newStatus,
        note: oldStatus
          ? `Updated from student profile (${getApplicationStatusLabel(oldStatus)} → ${getApplicationStatusLabel(newStatus)})`
          : "Updated from student profile",
      });
    }
  }

  const newLan = student.loan?.applicationNumber;
  if (
    newLan !== undefined &&
    newLan !== options.previousApplicationNumber &&
    primary.applicationNumber !== newLan
  ) {
    primary.applicationNumber = newLan || undefined;
  }
}

export async function ensureStudentLoanApplications(student: StudentDoc): Promise<boolean> {
  if ((student.loanApplications?.length ?? 0) > 0) {
    return false;
  }

  ensureStudentLoanApplicationsInMemory(student);
  if ((student.loanApplications?.length ?? 0) === 0) {
    return false;
  }

  await student.save();
  return true;
}

export async function loadStudentWithLoanApplications(studentId: string) {
  const student = await Student.findById(studentId)
    .populate("loanApplications.lenderId", "name slug")
    .populate("loan.lenderId", "name slug");

  if (!student) return null;

  await ensureStudentLoanApplications(student as StudentDoc);
  return Student.findById(studentId).populate("loanApplications.lenderId", "name slug");
}

function findApplicationByLenderId(student: StudentDoc, lenderId: Types.ObjectId) {
  return student.loanApplications?.find(
    (entry) => entry.lenderId?.toString() === lenderId.toString()
  );
}

export async function setStudentPrimaryLender(
  student: StudentDoc,
  lenderSlug: string,
  user?: SessionUser
) {
  const lenderId = await resolveLenderIdBySlug(lenderSlug);
  if (!lenderId) {
    throw new Error("Invalid lender selected");
  }

  if ((student.loanApplications?.length ?? 0) === 0) {
    const applicationStatus = deriveApplicationStatus(student);
    student.loanApplications = [
      {
        lenderId,
        applicationStatus,
        applicationNumber: student.loan?.applicationNumber,
        sentToBank: false,
        isPrimary: true,
        history: [
          {
            action: "added",
            note: "Primary lender assigned",
            createdBy: user?.id ? new Types.ObjectId(user.id) : undefined,
            createdByName: user?.name,
            createdAt: new Date(),
          },
        ],
      },
    ];
  } else {
    const existing = findApplicationByLenderId(student, lenderId);
    if (existing) {
      for (const entry of student.loanApplications ?? []) {
        entry.isPrimary = entry._id?.toString() === existing._id?.toString();
      }
      pushApplicationHistory(student, existing._id!, "lender_changed", user, {
        note: "Set as primary lender",
      });
    } else {
      const primary = getPrimaryApplication(student);
      if (!primary) {
        throw new Error("No loan application found");
      }
      primary.lenderId = lenderId;
      primary.isPrimary = true;
      pushApplicationHistory(student, primary._id!, "lender_changed", user, {
        note: "Primary lender changed",
      });
    }
  }

  if (!student.loan) {
    student.loan = { requested: 0, sanctioned: 0, disbursed: 0 };
  }
  student.loan.lenderId = lenderId;

  const lenderName = (await resolveLenderNameBySlug(lenderSlug)) ?? lenderSlug;
  appendLoanApplicationNote(
    student,
    `${user?.name ?? "Team"} changed primary lender to ${lenderName} on ${formatDateTime(new Date())}.`,
    user
  );

  await student.save();
}

export async function addStudentLoanApplication(
  student: StudentDoc,
  lenderSlug: string,
  user?: SessionUser
) {
  const lenderId = await resolveLenderIdBySlug(lenderSlug);
  if (!lenderId) {
    throw new Error("Invalid lender selected");
  }

  if ((student.loanApplications?.length ?? 0) === 0) {
    await setStudentPrimaryLender(student, lenderSlug, user);
    return student.loanApplications?.[0];
  }

  if (findApplicationByLenderId(student, lenderId)) {
    throw new Error("This lender already has an application for this student");
  }

  const applicationStatus = deriveApplicationStatus(student);
  const lenderName = (await resolveLenderNameBySlug(lenderSlug)) ?? lenderSlug;

  student.loanApplications!.push({
    lenderId,
    applicationStatus,
    sentToBank: false,
    isPrimary: false,
    history: [
      {
        action: "added",
        note: "Parallel bank application added",
        createdBy: user?.id ? new Types.ObjectId(user.id) : undefined,
        createdByName: user?.name,
        createdAt: new Date(),
      },
    ],
  });

  const newApp = student.loanApplications![student.loanApplications!.length - 1];
  appendLoanApplicationNote(
    student,
    `${user?.name ?? "Team"} added ${lenderName} as a parallel loan application on ${formatDateTime(new Date())}.`,
    user
  );

  syncGlobalSentToBank(student);
  await student.save();
  return newApp;
}

export async function sendLoanApplicationToBank(
  student: StudentDoc,
  applicationId: string,
  user?: SessionUser
) {
  const app = findLoanApplication(student, applicationId);
  if (!app) {
    throw new Error("Loan application not found");
  }

  if (app.sentToBank) {
    return {
      sentToBankAt: app.sentToBankAt ?? new Date(),
      sentToBankByName: app.sentToBankByName,
      lenderName: (app.lenderId as { name?: string } | undefined)?.name,
    };
  }

  const sentToBankAt = new Date();
  const sentToBankByName = user?.name;
  app.sentToBank = true;
  app.sentToBankAt = sentToBankAt;
  app.sentToBankByName = sentToBankByName;

  pushApplicationHistory(student, applicationId, "sent_to_bank", user);

  const lenderName =
    (app.lenderId as { name?: string } | undefined)?.name ?? "the lender";
  const noteContent = `${sentToBankByName ?? "Team"} sent student to ${lenderName} on ${formatDateTime(sentToBankAt)}.`;
  appendLoanApplicationNote(student, noteContent, user);

  student.timeline.push({
    status: student.status,
    note: `Application sent to ${lenderName}`,
    createdBy: user?.id ? new Types.ObjectId(user.id) : undefined,
    createdByName: sentToBankByName,
    createdAt: sentToBankAt,
  });

  syncGlobalSentToBank(student);
  await student.save();

  return { sentToBankAt, sentToBankByName, lenderName };
}

export async function updateLoanApplicationStatus(
  student: StudentDoc,
  applicationId: string,
  applicationStatus: ApplicationStatusId,
  user?: SessionUser
) {
  const app = findLoanApplication(student, applicationId);
  if (!app) {
    throw new Error("Loan application not found");
  }

  const oldStatus = app.applicationStatus;
  app.applicationStatus = applicationStatus;

  pushApplicationHistory(student, applicationId, "status_updated", user, {
    status: applicationStatus,
    note: oldStatus
      ? `Changed from ${getApplicationStatusLabel(oldStatus)} to ${getApplicationStatusLabel(applicationStatus)}`
      : undefined,
  });

  if (app.isPrimary) {
    const appFields = applyApplicationStatus(applicationStatus);
    student.applicationStatus = appFields.applicationStatus;
    student.status = appFields.status;
    student.loggedIn = appFields.loggedIn;
    if (!student.loan) student.loan = { requested: 0, sanctioned: 0, disbursed: 0 };
    student.loan.pfPaid = appFields.pfPaid;
  }

  await student.save();
}

export async function rejectLoanApplication(
  student: StudentDoc,
  applicationId: string,
  user?: SessionUser,
  rejectionNote?: string
) {
  const app = findLoanApplication(student, applicationId);
  if (!app) {
    throw new Error("Loan application not found");
  }

  const rejectedAt = new Date();
  app.applicationStatus = "rejected";
  app.rejectedAt = rejectedAt;
  app.rejectedByName = user?.name;
  app.rejectionNote = rejectionNote?.trim() || undefined;

  pushApplicationHistory(student, applicationId, "rejected", user, {
    status: "rejected",
    note: rejectionNote?.trim() || undefined,
  });

  const lenderName =
    (app.lenderId as { name?: string } | undefined)?.name ?? "the lender";
  appendLoanApplicationNote(
    student,
    `${user?.name ?? "Team"} recorded rejection from ${lenderName} on ${formatDateTime(rejectedAt)}${rejectionNote?.trim() ? `: ${rejectionNote.trim()}` : ""}.`,
    user
  );

  if (app.isPrimary) {
    const appFields = applyApplicationStatus("rejected");
    student.applicationStatus = appFields.applicationStatus;
    student.status = appFields.status;
    student.loggedIn = appFields.loggedIn;
  }

  await student.save();
}

export function serializeLoanApplications(
  student: {
    loanApplications?: Array<{
      _id?: Types.ObjectId;
      lenderId?: { _id?: Types.ObjectId; name?: string; slug?: string } | Types.ObjectId;
      applicationStatus?: string;
      applicationNumber?: string;
      sentToBank?: boolean;
      sentToBankAt?: Date;
      sentToBankByName?: string;
      rejectedAt?: Date;
      rejectedByName?: string;
      rejectionNote?: string;
      isPrimary?: boolean;
      history?: Array<{
        _id?: Types.ObjectId;
        action: string;
        status?: string;
        note?: string;
        createdByName?: string;
        createdAt?: Date;
      }>;
      createdAt?: Date;
      updatedAt?: Date;
    }>;
  }
) {
  return (student.loanApplications ?? []).map((entry) => {
    const lender =
      entry.lenderId && typeof entry.lenderId === "object" && "name" in entry.lenderId
        ? entry.lenderId
        : undefined;

    return {
      _id: entry._id?.toString() ?? "",
      lenderId: lender?._id?.toString(),
      lenderName: lender?.name,
      lenderSlug: lender?.slug,
      applicationStatus: (entry.applicationStatus ?? "docs_pending") as ApplicationStatusId,
      applicationNumber: entry.applicationNumber,
      sentToBank: Boolean(entry.sentToBank),
      sentToBankAt: entry.sentToBankAt,
      sentToBankByName: entry.sentToBankByName,
      rejectedAt: entry.rejectedAt,
      rejectedByName: entry.rejectedByName,
      rejectionNote: entry.rejectionNote,
      isPrimary: Boolean(entry.isPrimary),
      history: (entry.history ?? []).map((item) => ({
        _id: item._id?.toString(),
        action: item.action as LoanApplicationHistoryAction,
        status: item.status,
        note: item.note,
        createdByName: item.createdByName,
        createdAt: item.createdAt,
      })),
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  });
}

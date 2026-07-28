import { connectDB } from "@/lib/db/mongoose";
import { SupportConversation } from "@/models/SupportConversation";
import { SupportMessage } from "@/models/SupportMessage";
import { SupportVisitorSession } from "@/models/SupportVisitorSession";
import { Student } from "@/models/Student";
import { Application } from "@/models/Application";
import { STUDENT_RECORD_TYPE } from "@/lib/constants/student-record-type";
import { SITE_LEAD_PROMOTION_STATUS, SITE_LEAD_SOURCE } from "@/lib/constants/site-leads";
import { allocateWebsiteLeadId } from "@/lib/services/student-id.service";
import { normalizeIndianPhone } from "@/lib/validations/indian-fields";
import { sanitizeText } from "@/lib/utils/sanitize";
import { splitFullName } from "@/lib/utils/person-name";
import { hashContact } from "@/lib/services/support-faq-search.service";
import { findPendingWebsiteStudentLeadByPhone } from "@/lib/services/website-student-lead.service";
import type { SupportQualification } from "@/lib/constants/support";
import type { Types } from "mongoose";

export async function upsertChatStudentLead(params: {
  qualification: SupportQualification;
  ip?: string;
}) {
  await connectDB();
  const { qualification, ip } = params;
  const name = qualification.name?.trim() || "Website Chat";
  const phone = normalizeIndianPhone(qualification.phone || "");
  const { firstName, lastName } = splitFullName(name);

  const pending = phone ? await findPendingWebsiteStudentLeadByPhone(phone) : null;
  if (pending) {
    const student = await Student.findById(pending._id);
    if (student) {
      student.firstName = sanitizeText(firstName);
      student.lastName = sanitizeText(lastName) || ".";
      if (qualification.email?.trim()) student.email = qualification.email.trim();
      if (qualification.country?.trim()) student.targetCountry = qualification.country.trim();
      if (qualification.degree?.trim()) {
        student.education = {
          ...student.education,
          course: sanitizeText(qualification.degree),
        };
      }
      student.loan = {
        ...student.loan,
        requested: qualification.loanRequired ? 1 : student.loan?.requested,
      };
      student.metadata = {
        ...student.metadata,
        leadSource: SITE_LEAD_SOURCE.WEBSITE_CHAT,
        enquiryType: "eligibility",
        formPage: "/chat",
        currentStatus: qualification.admissionStatus,
        collateralPreference: qualification.collateralPreference,
        ip,
      };
      student.notes = [
        ...(student.notes ?? []),
        {
          content: [
            `Website chat handoff ${new Date().toISOString()}`,
            qualification.country ? `Country: ${qualification.country}` : null,
            qualification.degree ? `Degree: ${qualification.degree}` : null,
            qualification.admissionStatus ? `Status: ${qualification.admissionStatus}` : null,
            qualification.collateralPreference
              ? `Collateral: ${qualification.collateralPreference}`
              : null,
          ]
            .filter(Boolean)
            .join("\n"),
          createdByName: "Website Chat",
          createdAt: new Date(),
        },
      ];
      await student.save();
      return student;
    }
  }

  const studentId = await allocateWebsiteLeadId();
  const student = await Student.create({
    studentId,
    firstName: sanitizeText(firstName),
    lastName: sanitizeText(lastName) || ".",
    phone,
    email: qualification.email?.trim() || undefined,
    targetCountry: qualification.country?.trim(),
    education: qualification.degree ? { course: sanitizeText(qualification.degree) } : undefined,
    loan: { requested: qualification.loanRequired ? 1 : 0 },
    recordType: STUDENT_RECORD_TYPE.ADMISSION,
    applicationStatus: "docs_pending",
    loggedIn: false,
    status: "new",
    timeline: [{ status: "new", createdByName: "Website Chat", createdAt: new Date() }],
    metadata: {
      leadSource: SITE_LEAD_SOURCE.WEBSITE_CHAT,
      enquiryType: "eligibility",
      formPage: "/chat",
      promotionStatus: SITE_LEAD_PROMOTION_STATUS.PENDING,
      currentStatus: qualification.admissionStatus,
      collateralPreference: qualification.collateralPreference,
      ip,
    },
    notes: [
      {
        content: "Created from website support chat qualification",
        createdByName: "Website Chat",
        createdAt: new Date(),
      },
    ],
  });

  await Application.create({
    studentId: student._id,
    loanAmount: 0,
    status: "new",
    pipelineStage: "new",
    metadata: { createdByName: "Website Chat" },
  }).catch(() => null);

  return student;
}

export async function createWaitingConversation(params: {
  visitorId: string;
  qualification: SupportQualification;
  studentId: Types.ObjectId;
  welcomeMessage?: string;
}) {
  await connectDB();

  const conversation = await SupportConversation.create({
    visitorId: params.visitorId,
    studentId: params.studentId,
    status: "waiting",
    priority: "normal",
    qualification: params.qualification,
    lastMessageAt: new Date(),
    lastMessagePreview: params.welcomeMessage?.slice(0, 140),
  });

  const systemBody =
    params.welcomeMessage ?? "Thanks! An advisor will join shortly. You can keep messaging here.";

  await SupportMessage.create({
    conversationId: conversation._id,
    senderType: "system",
    type: "text",
    body: systemBody,
    deliveredAt: new Date(),
  });

  await SupportVisitorSession.findOneAndUpdate(
    { visitorId: params.visitorId },
    {
      $set: {
        conversationId: conversation._id,
        lastSeenAt: new Date(),
        phoneHash: params.qualification.phone ? hashContact(params.qualification.phone) : undefined,
        emailHash: params.qualification.email ? hashContact(params.qualification.email) : undefined,
      },
    },
    { upsert: true, new: true }
  );

  return conversation;
}

export async function appendSupportMessage(params: {
  conversationId: string;
  senderType: "visitor" | "agent" | "bot" | "system";
  senderId?: string;
  body: string;
  type?: "text" | "image" | "file";
}) {
  await connectDB();
  const message = await SupportMessage.create({
    conversationId: params.conversationId,
    senderType: params.senderType,
    senderId: params.senderId,
    type: params.type ?? "text",
    body: sanitizeText(params.body).slice(0, 4000),
    deliveredAt: new Date(),
  });

  await SupportConversation.updateOne(
    { _id: params.conversationId },
    {
      $set: {
        lastMessageAt: message.createdAt,
        lastMessagePreview: message.body.slice(0, 140),
        ...(params.senderType === "agent" ? { status: "in_progress" } : {}),
      },
    }
  );

  return message;
}

export async function listSupportConversations(params: {
  status: string;
  page: number;
  limit: number;
  assignedTo?: string;
}) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (params.status !== "all") {
    if (params.status === "assigned") {
      filter.status = { $in: ["assigned", "in_progress"] };
    } else if (params.status === "resolved") {
      filter.status = { $in: ["resolved", "closed"] };
    } else {
      filter.status = params.status;
    }
  }
  if (params.assignedTo) {
    filter.assignedTo = params.assignedTo;
  }

  const skip = (params.page - 1) * params.limit;
  const [items, total] = await Promise.all([
    SupportConversation.find(filter)
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(params.limit)
      .populate("assignedTo", "name email")
      .populate("studentId", "studentId firstName lastName phone targetCountry")
      .lean(),
    SupportConversation.countDocuments(filter),
  ]);

  return { items, total, page: params.page, limit: params.limit };
}

export async function getSupportConversationCounts() {
  await connectDB();
  const [waiting, assigned, resolved] = await Promise.all([
    SupportConversation.countDocuments({ status: "waiting" }),
    SupportConversation.countDocuments({ status: { $in: ["assigned", "in_progress"] } }),
    SupportConversation.countDocuments({ status: { $in: ["resolved", "closed"] } }),
  ]);
  return { waiting, assigned, resolved };
}

export async function getSupportConversationById(id: string) {
  await connectDB();
  return SupportConversation.findById(id)
    .populate("assignedTo", "name email")
    .populate("studentId", "studentId firstName lastName phone email targetCountry education")
    .lean();
}

export async function listSupportMessages(conversationId: string, limit = 100) {
  await connectDB();
  return SupportMessage.find({ conversationId }).sort({ createdAt: 1 }).limit(limit).lean();
}

export async function assignSupportConversation(params: {
  conversationId: string;
  assigneeId: string;
}) {
  await connectDB();
  const conversation = await SupportConversation.findByIdAndUpdate(
    params.conversationId,
    {
      $set: {
        assignedTo: params.assigneeId,
        status: "assigned",
      },
    },
    { returnDocument: "after" }
  )
    .populate("assignedTo", "name email")
    .lean();

  if (conversation) {
    await SupportMessage.create({
      conversationId: conversation._id,
      senderType: "system",
      type: "text",
      body: "An advisor has joined the conversation.",
      deliveredAt: new Date(),
    });
  }

  return conversation;
}

export async function closeSupportConversation(params: {
  conversationId: string;
  closedBy: string;
  status: "resolved" | "closed";
}) {
  await connectDB();
  return SupportConversation.findByIdAndUpdate(
    params.conversationId,
    {
      $set: {
        status: params.status,
        closedAt: new Date(),
        closedBy: params.closedBy,
      },
    },
    { returnDocument: "after" }
  ).lean();
}

export async function markMessagesSeen(params: {
  conversationId: string;
  viewer: "visitor" | "agent";
}) {
  await connectDB();
  const opposite = params.viewer === "visitor" ? "agent" : "visitor";
  await SupportMessage.updateMany(
    {
      conversationId: params.conversationId,
      senderType: opposite,
      seenAt: { $exists: false },
    },
    { $set: { seenAt: new Date() } }
  );
}

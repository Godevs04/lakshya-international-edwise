import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import type { StudentStatus } from "@/lib/constants/statuses";

const DocumentSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    mimeType: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const TimelineSchema = new Schema(
  {
    status: { type: String, required: true },
    note: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdByName: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const NoteSchema = new Schema(
  {
    content: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdByName: { type: String },
    mentionedUserIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dueDate: { type: Date },
    reminderSentAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const LoanApplicationHistorySchema = new Schema(
  {
    action: {
      type: String,
      enum: ["added", "sent_to_bank", "status_updated", "rejected", "lender_changed"],
      required: true,
    },
    status: { type: String },
    note: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdByName: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const LoanApplicationSchema = new Schema(
  {
    lenderId: { type: Schema.Types.ObjectId, ref: "Lender", required: true },
    applicationStatus: {
      type: String,
      enum: [
        "docs_pending",
        "loggedin",
        "sanctioned",
        "pf_paid",
        "pf_pending",
        "disbursed",
        "rejected",
      ],
      default: "docs_pending",
    },
    applicationNumber: { type: String, trim: true },
    sentToBank: { type: Boolean, default: false },
    sentToBankAt: { type: Date },
    sentToBankByName: { type: String, trim: true },
    rejectedAt: { type: Date },
    rejectedByName: { type: String, trim: true },
    rejectionNote: { type: String, trim: true },
    isPrimary: { type: Boolean, default: false },
    history: [LoanApplicationHistorySchema],
  },
  { timestamps: true }
);

export interface IStudent extends Document {
  studentId: string;
  photo?: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dob?: Date;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address: {
    line?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  aadhaar?: string;
  pan?: string;
  education: {
    college?: string;
    course?: string;
    year?: string;
  };
  loan: {
    requested?: number;
    sanctioned?: number;
    disbursed?: number;
    disbursedAt?: Date;
    disbursementType?: "full" | "tranche";
    currency?: "INR" | "USD";
    lenderId?: Types.ObjectId;
    roi?: number;
    interest?: number;
    processingFee?: number;
    pfPaid?: boolean;
    bankName?: string;
    applicationNumber?: string;
  };
  partnerId?: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  assignedAt?: Date;
  targetCountry?: string;
  targetIntake?: string;
  targetDegree?: string;
  targetUniversity?: string;
  admissionRevenue?: number;
  recordType?: "lead" | "student";
  applicationStatus?: string;
  loggedIn?: boolean;
  sentToBank?: boolean;
  sentToBankAt?: Date;
  sentToBankByName?: string;
  loanApplications: Array<{
    _id?: Types.ObjectId;
    lenderId?: Types.ObjectId;
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
      createdBy?: Types.ObjectId;
      createdByName?: string;
      createdAt?: Date;
    }>;
    createdAt?: Date;
    updatedAt?: Date;
  }>;
  commissionPercentOverride?: number;
  ourCommissionPercent?: number;
  commissionReceived: number;
  commissionReceipts: Array<{
    _id?: Types.ObjectId;
    amount: number;
    note?: string;
    receivedAt?: Date;
    recordedBy?: Types.ObjectId;
    recordedByName?: string;
  }>;
  commissionSettled: number;
  commissionSettlements: Array<{
    _id?: Types.ObjectId;
    amount: number;
    note?: string;
    settledAt?: Date;
    settledBy?: Types.ObjectId;
    settledByName?: string;
  }>;
  status: StudentStatus;
  remarks?: string;
  documents: Array<{
    _id?: Types.ObjectId;
    name: string;
    url: string;
    publicId: string;
    mimeType: string;
    uploadedBy?: Types.ObjectId;
    uploadedAt?: Date;
  }>;
  timeline: Array<{
    _id?: Types.ObjectId;
    status: string;
    note?: string;
    createdBy?: Types.ObjectId;
    createdByName?: string;
    createdAt?: Date;
  }>;
  notes: Array<{
    _id?: Types.ObjectId;
    content: string;
    createdBy?: Types.ObjectId;
    createdByName?: string;
    dueDate?: Date;
    reminderSentAt?: Date;
    createdAt?: Date;
  }>;
  metadata: {
    createdBy?: Types.ObjectId;
    createdByName?: string;
    updatedBy?: Types.ObjectId;
    ip?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    studentId: { type: String, required: true, unique: true },
    photo: { type: String },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["male", "female", "other", ""] },
    dob: { type: Date },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: {
      line: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    aadhaar: { type: String },
    pan: { type: String },
    education: {
      college: { type: String },
      course: { type: String },
      year: { type: String },
    },
    loan: {
      requested: { type: Number, default: 0 },
      sanctioned: { type: Number, default: 0 },
      disbursed: { type: Number, default: 0 },
      disbursedAt: { type: Date },
      disbursementType: { type: String, enum: ["full", "tranche"], required: false },
      currency: { type: String, enum: ["INR", "USD"], default: "INR" },
      lenderId: { type: Schema.Types.ObjectId, ref: "Lender" },
      roi: { type: Number, default: 0 },
      interest: { type: Number, default: 0 },
      processingFee: { type: Number, default: 0 },
      pfPaid: { type: Boolean, default: false },
      bankName: { type: String },
      applicationNumber: { type: String },
    },
    partnerId: { type: Schema.Types.ObjectId, ref: "Partner" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    assignedAt: { type: Date },
    targetCountry: { type: String, trim: true },
    targetIntake: { type: String, trim: true },
    targetDegree: { type: String, trim: true },
    targetUniversity: { type: String, trim: true },
    admissionRevenue: { type: Number, default: 0, min: 0 },
    recordType: { type: String, enum: ["lead", "student"], default: "student" },
    applicationStatus: {
      type: String,
      enum: [
        "docs_pending",
        "loggedin",
        "sanctioned",
        "pf_paid",
        "pf_pending",
        "disbursed",
        "rejected",
      ],
      default: "docs_pending",
    },
    loggedIn: { type: Boolean, default: false },
    sentToBank: { type: Boolean, default: false },
    sentToBankAt: { type: Date },
    sentToBankByName: { type: String, trim: true },
    loanApplications: [LoanApplicationSchema],
    commissionPercentOverride: { type: Number, min: 0, max: 100 },
    ourCommissionPercent: { type: Number, min: 0, max: 100 },
    commissionReceived: { type: Number, default: 0, min: 0 },
    commissionReceipts: [
      {
        amount: { type: Number, required: true, min: 0 },
        note: { type: String, trim: true },
        receivedAt: { type: Date, default: Date.now },
        recordedBy: { type: Schema.Types.ObjectId, ref: "User" },
        recordedByName: { type: String, trim: true },
      },
    ],
    commissionSettled: { type: Number, default: 0, min: 0 },
    commissionSettlements: [
      {
        amount: { type: Number, required: true, min: 0 },
        note: { type: String, trim: true },
        settledAt: { type: Date, default: Date.now },
        settledBy: { type: Schema.Types.ObjectId, ref: "User" },
        settledByName: { type: String, trim: true },
      },
    ],
    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "documents_pending",
        "submitted",
        "under_verification",
        "approved",
        "sanctioned",
        "disbursed",
        "rejected",
        "closed",
      ],
      default: "new",
    },
    remarks: { type: String },
    documents: [DocumentSchema],
    timeline: [TimelineSchema],
    notes: [NoteSchema],
    metadata: {
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
      createdByName: { type: String },
      updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
      ip: { type: String },
    },
  },
  { timestamps: true }
);

StudentSchema.index({ status: 1, partnerId: 1, createdAt: -1 });
StudentSchema.index({ partnerId: 1, status: 1 });
StudentSchema.index({ assignedTo: 1, createdAt: -1 });
StudentSchema.index({ "loan.lenderId": 1, status: 1 });
StudentSchema.index({ applicationStatus: 1 });
StudentSchema.index({ sentToBank: 1 });
StudentSchema.index({ loggedIn: 1 });
StudentSchema.index({ recordType: 1, createdAt: -1 });
StudentSchema.index(
  {
    firstName: "text",
    lastName: "text",
    phone: "text",
    email: "text",
    studentId: "text",
    "loan.applicationNumber": "text",
  },
  { name: "student_text_search" }
);

// Next.js hot reload keeps a stale Mongoose model; re-register in dev so schema changes apply.
if (process.env.NODE_ENV !== "production" && mongoose.models.Student) {
  delete mongoose.models.Student;
}

export const Student: Model<IStudent> =
  mongoose.models.Student ?? mongoose.model<IStudent>("Student", StudentSchema);

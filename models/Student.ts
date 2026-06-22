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
    dueDate: { type: Date },
    reminderSentAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
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
    interest?: number;
    bankName?: string;
    applicationNumber?: string;
  };
  partnerId?: Types.ObjectId;
  commissionPercentOverride?: number;
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
      interest: { type: Number, default: 0 },
      bankName: { type: String },
      applicationNumber: { type: String },
    },
    partnerId: { type: Schema.Types.ObjectId, ref: "Partner" },
    commissionPercentOverride: { type: Number, min: 0, max: 100 },
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

export const Student: Model<IStudent> =
  mongoose.models.Student ?? mongoose.model<IStudent>("Student", StudentSchema);

import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { PartnerStatus } from "@/lib/constants/statuses";
import type { PartnerActionStatus } from "@/lib/constants/partner-action-statuses";

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

export interface IPartner extends Document {
  partnerCode?: string;
  photo?: string;
  companyLogo?: string;
  companyName: string;
  owner?: string;
  phone?: string;
  email?: string;
  address?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
  };
  contacts: Array<{
    _id?: mongoose.Types.ObjectId;
    name?: string;
    phone?: string;
    email?: string;
    role?: string;
  }>;
  actionStatus: PartnerActionStatus;
  gst?: string;
  commissionPercent: number;
  bankDetails: {
    accountName?: string;
    accountNumber?: string;
    ifsc?: string;
    bankName?: string;
  };
  status: PartnerStatus;
  agreementUrl?: string;
  documents: Array<{
    _id?: mongoose.Types.ObjectId;
    name: string;
    url: string;
    publicId: string;
    mimeType: string;
    uploadedBy?: mongoose.Types.ObjectId;
    uploadedAt?: Date;
  }>;
  studentsCount: number;
  totalLoanValue: number;
  performance: {
    monthlyLeads: number;
    sanctionRate: number;
    disbursementTotal: number;
    commissionEarned: number;
    commissionSettled: number;
  };
  commissionSettlements: Array<{
    _id?: mongoose.Types.ObjectId;
    amount: number;
    note?: string;
    settledAt?: Date;
    settledBy?: mongoose.Types.ObjectId;
    settledByName?: string;
    studentId?: mongoose.Types.ObjectId;
    studentName?: string;
  }>;
  metadata: {
    createdBy?: mongoose.Types.ObjectId;
    createdByName?: string;
    leadSource?: string;
    promotionStatus?: string;
    promotedAt?: Date;
    promotedBy?: mongoose.Types.ObjectId;
    promotedByName?: string;
    isOwner?: boolean;
    formCity?: string;
    whatsapp?: string;
    possibleDuplicate?: boolean;
    assignedTo?: mongoose.Types.ObjectId;
    assignedToName?: string;
    assignedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PartnerSchema = new Schema<IPartner>(
  {
    partnerCode: { type: String, trim: true, unique: true, sparse: true },
    photo: { type: String },
    companyLogo: { type: String },
    companyName: { type: String, required: true, trim: true },
    owner: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String },
    location: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
    },
    contacts: [
      {
        name: { type: String, trim: true },
        phone: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        role: { type: String, trim: true },
      },
    ],
    actionStatus: {
      type: String,
      enum: ["active", "need_action", "call_back"],
      default: "active",
    },
    gst: { type: String, trim: true },
    commissionPercent: { type: Number, default: 0, min: 0, max: 100 },
    bankDetails: {
      accountName: { type: String },
      accountNumber: { type: String },
      ifsc: { type: String },
      bankName: { type: String },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "suspended"],
      default: "active",
    },
    agreementUrl: { type: String },
    documents: [DocumentSchema],
    studentsCount: { type: Number, default: 0 },
    totalLoanValue: { type: Number, default: 0 },
    performance: {
      monthlyLeads: { type: Number, default: 0 },
      sanctionRate: { type: Number, default: 0 },
      disbursementTotal: { type: Number, default: 0 },
      commissionEarned: { type: Number, default: 0 },
      commissionSettled: { type: Number, default: 0, min: 0 },
    },
    commissionSettlements: [
      {
        amount: { type: Number, required: true, min: 0 },
        note: { type: String, trim: true },
        settledAt: { type: Date, default: Date.now },
        settledBy: { type: Schema.Types.ObjectId, ref: "User" },
        settledByName: { type: String, trim: true },
        studentId: { type: Schema.Types.ObjectId, ref: "Student" },
        studentName: { type: String, trim: true },
      },
    ],
    metadata: {
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
      createdByName: { type: String },
      leadSource: { type: String, trim: true },
      promotionStatus: { type: String, enum: ["pending", "promoted"], trim: true },
      promotedAt: { type: Date },
      promotedBy: { type: Schema.Types.ObjectId, ref: "User" },
      promotedByName: { type: String, trim: true },
      isOwner: { type: Boolean },
      formCity: { type: String, trim: true },
      whatsapp: { type: String, trim: true },
      possibleDuplicate: { type: Boolean },
      assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
      assignedToName: { type: String, trim: true },
      assignedAt: { type: Date },
    },
  },
  { timestamps: true }
);

PartnerSchema.index({ companyName: 1 });
PartnerSchema.index({ status: 1 });
PartnerSchema.index({ actionStatus: 1 });
PartnerSchema.index(
  { companyName: "text", owner: "text", phone: "text", email: "text", gst: "text" },
  { name: "partner_text_search" }
);

// Next.js hot reload keeps a stale Mongoose model; re-register in dev so schema changes apply.
if (process.env.NODE_ENV !== "production" && mongoose.models.Partner) {
  delete mongoose.models.Partner;
}

export const Partner: Model<IPartner> =
  mongoose.models.Partner ?? mongoose.model<IPartner>("Partner", PartnerSchema);

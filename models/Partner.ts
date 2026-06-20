import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { PartnerStatus } from "@/lib/constants/statuses";

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
  photo?: string;
  companyLogo?: string;
  companyName: string;
  owner?: string;
  phone?: string;
  email?: string;
  address?: string;
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
  };
  metadata: {
    createdBy?: mongoose.Types.ObjectId;
    createdByName?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PartnerSchema = new Schema<IPartner>(
  {
    photo: { type: String },
    companyLogo: { type: String },
    companyName: { type: String, required: true, trim: true },
    owner: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String },
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
    },
    metadata: {
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
      createdByName: { type: String },
    },
  },
  { timestamps: true }
);

PartnerSchema.index({ companyName: 1 });
PartnerSchema.index({ status: 1 });
PartnerSchema.index(
  { companyName: "text", owner: "text", phone: "text", email: "text", gst: "text" },
  { name: "partner_text_search" }
);

export const Partner: Model<IPartner> =
  mongoose.models.Partner ?? mongoose.model<IPartner>("Partner", PartnerSchema);

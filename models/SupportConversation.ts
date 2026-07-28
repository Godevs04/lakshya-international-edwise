import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import {
  SUPPORT_CONVERSATION_STATUSES,
  SUPPORT_ADMISSION_STATUSES,
  SUPPORT_COLLATERAL_PREFERENCES,
  type SupportConversationStatus,
  type SupportQualification,
} from "@/lib/constants/support";

export interface ISupportConversation extends Document {
  studentId?: Types.ObjectId;
  visitorId: string;
  assignedTo?: Types.ObjectId;
  status: SupportConversationStatus;
  priority: "low" | "normal" | "high";
  tags: string[];
  qualification: SupportQualification;
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  closedAt?: Date;
  closedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QualificationSchema = new Schema(
  {
    country: { type: String, trim: true },
    degree: { type: String, trim: true },
    admissionStatus: { type: String, enum: SUPPORT_ADMISSION_STATUSES },
    collateralPreference: { type: String, enum: SUPPORT_COLLATERAL_PREFERENCES },
    loanRequired: { type: Boolean },
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
  },
  { _id: false }
);

const SupportConversationSchema = new Schema<ISupportConversation>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", index: true },
    visitorId: { type: String, required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", index: true },
    status: {
      type: String,
      enum: SUPPORT_CONVERSATION_STATUSES,
      default: "waiting",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    tags: { type: [String], default: [] },
    qualification: { type: QualificationSchema, default: {} },
    lastMessageAt: { type: Date },
    lastMessagePreview: { type: String },
    closedAt: { type: Date },
    closedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

SupportConversationSchema.index({ status: 1, lastMessageAt: -1 });
SupportConversationSchema.index({ assignedTo: 1, status: 1 });

export const SupportConversation: Model<ISupportConversation> =
  mongoose.models.SupportConversation ??
  mongoose.model<ISupportConversation>("SupportConversation", SupportConversationSchema);

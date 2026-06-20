import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import type { ApplicationStatus } from "@/lib/constants/statuses";

export interface IApplication extends Document {
  studentId: Types.ObjectId;
  partnerId?: Types.ObjectId;
  loanAmount: number;
  status: ApplicationStatus;
  pipelineStage: ApplicationStatus;
  assignedTo?: Types.ObjectId;
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: Date;
  notes?: string;
  metadata: {
    createdBy?: Types.ObjectId;
    createdByName?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    partnerId: { type: Schema.Types.ObjectId, ref: "Partner" },
    loanAmount: { type: Number, required: true, default: 0 },
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
    pipelineStage: {
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
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    dueDate: { type: Date },
    notes: { type: String },
    metadata: {
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
      createdByName: { type: String },
    },
  },
  { timestamps: true }
);

ApplicationSchema.index({ status: 1, pipelineStage: 1 });
ApplicationSchema.index({ studentId: 1 });
ApplicationSchema.index({ partnerId: 1, status: 1 });

export const Application: Model<IApplication> =
  mongoose.models.Application ??
  mongoose.model<IApplication>("Application", ApplicationSchema);

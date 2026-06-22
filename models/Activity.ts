import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface IActivity extends Document {
  action: string;
  description: string;
  resourceType: string;
  resourceId?: string;
  userId?: Types.ObjectId;
  userName?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    action: { type: String, required: true },
    description: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    userName: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ActivitySchema.index({ createdAt: -1 });
ActivitySchema.index({ resourceType: 1, resourceId: 1 });

export const Activity: Model<IActivity> =
  mongoose.models.Activity ?? mongoose.model<IActivity>("Activity", ActivitySchema);

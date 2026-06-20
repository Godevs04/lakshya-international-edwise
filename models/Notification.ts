import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: "info" | "success" | "warning" | "reminder" | "system";
  title: string;
  body: string;
  read: boolean;
  link?: string;
  scheduledAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["info", "success", "warning", "reminder", "system"],
      default: "info",
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: { type: String },
    scheduledAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ??
  mongoose.model<INotification>("Notification", NotificationSchema);

import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export type TaskStatus = "open" | "done" | "cancelled";

export interface ITask extends Document {
  title: string;
  description?: string;
  studentId?: Types.ObjectId;
  partnerId?: Types.ObjectId;
  assignedTo: Types.ObjectId;
  dueAt: Date;
  reminderAt?: Date;
  reminderSentAt?: Date;
  status: TaskStatus;
  metadata: {
    createdBy?: Types.ObjectId;
    createdByName?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student" },
    partnerId: { type: Schema.Types.ObjectId, ref: "Partner" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dueAt: { type: Date, required: true },
    reminderAt: { type: Date },
    reminderSentAt: { type: Date },
    status: { type: String, enum: ["open", "done", "cancelled"], default: "open" },
    metadata: {
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
      createdByName: { type: String },
    },
  },
  { timestamps: true }
);

TaskSchema.index({ assignedTo: 1, status: 1, dueAt: 1 });
TaskSchema.index({ dueAt: 1, status: 1 });

export const Task: Model<ITask> =
  mongoose.models.Task ?? mongoose.model<ITask>("Task", TaskSchema);

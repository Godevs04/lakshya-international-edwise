import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface ISupportVisitorSession extends Document {
  visitorId: string;
  phoneHash?: string;
  emailHash?: string;
  conversationId?: Types.ObjectId;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupportVisitorSessionSchema = new Schema<ISupportVisitorSession>(
  {
    visitorId: { type: String, required: true, unique: true, index: true },
    phoneHash: { type: String, index: true },
    emailHash: { type: String },
    conversationId: { type: Schema.Types.ObjectId, ref: "SupportConversation" },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SupportVisitorSession: Model<ISupportVisitorSession> =
  mongoose.models.SupportVisitorSession ??
  mongoose.model<ISupportVisitorSession>("SupportVisitorSession", SupportVisitorSessionSchema);

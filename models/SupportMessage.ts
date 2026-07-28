import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import {
  SUPPORT_MESSAGE_SENDER_TYPES,
  SUPPORT_MESSAGE_TYPES,
  type SupportMessageSenderType,
  type SupportMessageType,
} from "@/lib/constants/support";

export interface ISupportMessage extends Document {
  conversationId: Types.ObjectId;
  senderType: SupportMessageSenderType;
  senderId?: Types.ObjectId;
  type: SupportMessageType;
  body: string;
  attachmentUrl?: string;
  attachmentName?: string;
  seenAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupportMessageSchema = new Schema<ISupportMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "SupportConversation",
      required: true,
      index: true,
    },
    senderType: { type: String, enum: SUPPORT_MESSAGE_SENDER_TYPES, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: SUPPORT_MESSAGE_TYPES, default: "text" },
    body: { type: String, required: true, trim: true },
    attachmentUrl: { type: String },
    attachmentName: { type: String },
    seenAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

SupportMessageSchema.index({ conversationId: 1, createdAt: 1 });

export const SupportMessage: Model<ISupportMessage> =
  mongoose.models.SupportMessage ??
  mongoose.model<ISupportMessage>("SupportMessage", SupportMessageSchema);

import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISupportFaq extends Document {
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  priority: number;
  isActive: boolean;
  views: number;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SupportFaqSchema = new Schema<ISupportFaq>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    keywords: { type: [String], default: [] },
    priority: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    views: { type: Number, default: 0 },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SupportFaqSchema.index({ question: "text", answer: "text", keywords: "text" });

export const SupportFaq: Model<ISupportFaq> =
  mongoose.models.SupportFaq ?? mongoose.model<ISupportFaq>("SupportFaq", SupportFaqSchema);

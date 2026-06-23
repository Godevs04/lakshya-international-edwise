import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ILender extends Document {
  name: string;
  slug: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const LenderSchema = new Schema<ILender>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export const Lender: Model<ILender> =
  mongoose.models.Lender ?? mongoose.model<ILender>("Lender", LenderSchema);

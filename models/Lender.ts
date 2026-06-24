import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ILender extends Document {
  name: string;
  slug: string;
  logoUrl?: string;
  logoPublicId?: string;
  accentColor?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const LenderSchema = new Schema<ILender>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    logoUrl: { type: String, trim: true },
    logoPublicId: { type: String, trim: true },
    accentColor: { type: String, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models.Lender) {
  delete mongoose.models.Lender;
}

export const Lender: Model<ILender> =
  mongoose.models.Lender ?? mongoose.model<ILender>("Lender", LenderSchema);

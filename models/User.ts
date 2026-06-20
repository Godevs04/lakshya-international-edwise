import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { UserRole } from "@/types";
import { USER_STATUSES, type UserStatus } from "@/lib/constants/statuses";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  rememberMe: boolean;
  lastLogin?: Date;
  status: UserStatus;
  resetToken?: string;
  resetTokenExpiry?: Date;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
  emailOtpHash?: string;
  emailOtpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["super_admin", "admin", "manager", "staff", "viewer"],
      default: "staff",
    },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    rememberMe: { type: Boolean, default: false },
    lastLogin: { type: Date },
    status: { type: String, enum: USER_STATUSES, default: "pending" },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    verifyToken: { type: String },
    verifyTokenExpiry: { type: Date },
    emailOtpHash: { type: String },
    emailOtpExpiry: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ resetToken: 1 });
UserSchema.index({ verifyToken: 1 });

// Next.js hot reload keeps a stale Mongoose model; re-register in dev so schema changes apply.
if (process.env.NODE_ENV !== "production" && mongoose.models.User) {
  delete mongoose.models.User;
}

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

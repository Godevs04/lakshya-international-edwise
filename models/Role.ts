import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { UserRole } from "@/types";

export interface IRole extends Document {
  name: UserRole;
  label: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      enum: ["super_admin", "admin", "manager", "staff", "viewer"],
      required: true,
      unique: true,
    },
    label: { type: String, required: true },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

export const Role: Model<IRole> =
  mongoose.models.Role ?? mongoose.model<IRole>("Role", RoleSchema);

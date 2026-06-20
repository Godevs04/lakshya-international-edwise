"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { getAuthUrl } from "@/lib/config/env";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/services/email.service";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  registerSchema,
} from "@/lib/validations/schemas";
import type { ActionResult } from "@/types";

export async function registerAction(
  formData: FormData
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  await connectDB();
  const existing = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (existing) {
    return { success: false, error: "Email already registered" };
  }

  const verifyToken = crypto.randomBytes(32).toString("hex");
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await User.create({
    email: parsed.data.email.toLowerCase(),
    name: parsed.data.name,
    passwordHash,
    role: "staff",
    verifyToken,
    verifyTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: "active",
  });

  const verifyUrl = `${getAuthUrl()}/verify-email?token=${verifyToken}`;
  await sendVerificationEmail(parsed.data.email, parsed.data.name, verifyUrl);

  return { success: true };
}

export async function forgotPasswordAction(
  formData: FormData
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  await connectDB();
  const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (!user) {
    return { success: true };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetUrl = `${getAuthUrl()}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail(user.email, user.name, resetUrl);

  return { success: true };
}

export async function resetPasswordAction(
  formData: FormData
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  await connectDB();
  const user = await User.findOne({
    resetToken: parsed.data.token,
    resetTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    return { success: false, error: "Invalid or expired reset token" };
  }

  user.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  return { success: true };
}

export async function verifyEmailAction(token: string): Promise<ActionResult> {
  await connectDB();
  const user = await User.findOne({
    verifyToken: token,
    verifyTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    return { success: false, error: "Invalid or expired verification token" };
  }

  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpiry = undefined;
  await user.save();

  return { success: true };
}

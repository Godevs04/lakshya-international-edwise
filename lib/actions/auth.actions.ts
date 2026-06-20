"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import {
  sendPasswordResetEmail,
  sendOtpEmail,
} from "@/lib/services/email.service";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  registerSchema,
} from "@/lib/validations/schemas";
import type { ActionResult } from "@/types";
import { runLoggedMutation } from "@/lib/action-utils";

const OTP_EXPIRY_MS = 10 * 60 * 1000;

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

async function setUserOtp(userId: string, otp: string): Promise<void> {
  const emailOtpHash = await bcrypt.hash(otp, 10);
  await User.findByIdAndUpdate(userId, {
    emailOtpHash,
    emailOtpExpiry: new Date(Date.now() + OTP_EXPIRY_MS),
  });
}

export async function registerAction(
  formData: FormData
): Promise<ActionResult> {
  return runLoggedMutation("registerAction", async () => {
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
  const email = parsed.data.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    return { success: false, error: "Email already registered" };
  }

  const otp = generateOtp();
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await User.create({
    email,
    name: parsed.data.name,
    passwordHash,
    role: "staff",
    isVerified: false,
    status: "pending",
  });

  await setUserOtp(user._id.toString(), otp);
  const sent = await sendOtpEmail(email, parsed.data.name, otp);

  if (!sent) {
    return {
      success: false,
      error: "Account created but OTP email could not be sent. Check SMTP settings or contact support.",
    };
  }

  return { success: true, data: undefined, code: "OTP_SENT" };
  });
}

export async function verifyOtpAction(
  email: string,
  otp: string
): Promise<ActionResult> {
  return runLoggedMutation("verifyOtpAction", async () => {
  if (!email || !otp || otp.length !== 6) {
    return { success: false, error: "Please enter a valid 6-digit code" };
  }

  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return { success: false, error: "Account not found" };
  }

  if (user.isVerified) {
    return { success: true, code: "ALREADY_VERIFIED" };
  }

  if (!user.emailOtpHash || !user.emailOtpExpiry || user.emailOtpExpiry < new Date()) {
    return { success: false, error: "OTP expired. Please request a new code.", code: "OTP_EXPIRED" };
  }

  const valid = await bcrypt.compare(otp, user.emailOtpHash);
  if (!valid) {
    return { success: false, error: "Invalid verification code" };
  }

  user.isVerified = true;
  user.emailOtpHash = undefined;
  user.emailOtpExpiry = undefined;
  user.status = "pending";
  await user.save();

  return { success: true, code: "AWAITING_APPROVAL" };
  });
}

export async function resendOtpAction(email: string): Promise<ActionResult> {
  return runLoggedMutation("resendOtpAction", async () => {
  if (!email) {
    return { success: false, error: "Email is required" };
  }

  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return { success: true };
  }

  if (user.isVerified) {
    return { success: false, error: "Email is already verified" };
  }

  const otp = generateOtp();
  await setUserOtp(user._id.toString(), otp);
  const sent = await sendOtpEmail(user.email, user.name, otp);

  if (!sent) {
    return { success: false, error: "Could not send OTP email. Check SMTP configuration." };
  }

  return { success: true };
  });
}

export async function validateLoginAction(
  email: string,
  password: string
): Promise<ActionResult> {
  return runLoggedMutation("validateLoginAction", async () => {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return { success: false, error: "Invalid email or password" };
  }

  if (!user.isVerified) {
    return {
      success: false,
      error: "Please verify your email with the OTP sent to your inbox.",
      code: "UNVERIFIED",
    };
  }

  if (user.status === "pending") {
    return {
      success: false,
      error: "Your account is in the approval queue. An admin will onboard you soon.",
      code: "PENDING",
    };
  }

  if (user.status !== "active") {
    return {
      success: false,
      error: "Your account is not active. Please contact your administrator.",
      code: "INACTIVE",
    };
  }

  return { success: true };
  });
}

export async function forgotPasswordAction(
  formData: FormData
): Promise<ActionResult> {
  return runLoggedMutation("forgotPasswordAction", async () => {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  await connectDB();
  const user = await User.findOne({ email: parsed.data.email.toLowerCase(), status: "active" });
  if (!user) {
    return { success: true };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetUrl = `${process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:4000"}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail(user.email, user.name, resetUrl);

  return { success: true };
  });
}

export async function resetPasswordAction(
  formData: FormData
): Promise<ActionResult> {
  return runLoggedMutation("resetPasswordAction", async () => {
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
  });
}

export async function verifyEmailAction(token: string): Promise<ActionResult> {
  return runLoggedMutation("verifyEmailAction", async () => {
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
  if (user.role !== "super_admin" && user.role !== "admin") {
    user.status = "pending";
  }
  await user.save();

  return { success: true, code: "AWAITING_APPROVAL" };
  });
}

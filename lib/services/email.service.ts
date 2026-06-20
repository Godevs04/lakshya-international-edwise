import nodemailer from "nodemailer";
import { getDefaultCompanySettings } from "@/lib/config/app-defaults";
import { logger } from "@/lib/logger";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

function trim(value: string | undefined): string | undefined {
  return value?.trim();
}

function createTransporter() {
  const host = trim(process.env.SMTP_HOST);
  const port = trim(process.env.SMTP_PORT);
  const user = trim(process.env.SMTP_USER);
  const pass = trim(process.env.SMTP_PASS);

  if (!host || !user || !pass) {
    return null;
  }

  const portNum = parseInt(port ?? "587", 10);

  return nodemailer.createTransport({
    host,
    port: portNum,
    secure: portNum === 465,
    auth: { user, pass },
    ...(portNum === 587 ? { requireTLS: true } : {}),
  });
}

function getFromAddress(): string {
  return trim(process.env.SMTP_FROM) ?? trim(process.env.SMTP_USER) ?? getDefaultCompanySettings().email ?? "";
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) {
    logger.warn("SMTP not configured in .env.local, email not sent", params.subject);
    return false;
  }

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    return true;
  } catch (error) {
    logger.error("Email send failed", error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<boolean> {
  const company = getDefaultCompanySettings().name;
  return sendEmail({
    to: email,
    subject: `Reset Your Password — ${company}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  verifyUrl: string
): Promise<boolean> {
  const company = getDefaultCompanySettings().name;
  return sendEmail({
    to: email,
    subject: `Verify Your Email — ${company}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Hi ${name},</p>
        <p>Please verify your email address by clicking the link below.</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Verify Email</a>
      </div>
    `,
  });
}

export async function sendOtpEmail(
  email: string,
  name: string,
  otp: string
): Promise<boolean> {
  const company = getDefaultCompanySettings().name;
  return sendEmail({
    to: email,
    subject: `Your verification code — ${company}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #6D5EF7;">Verify your email</h2>
        <p>Hi ${name},</p>
        <p>Use the one-time code below to verify your email address. This code expires in <strong>10 minutes</strong>.</p>
        <div style="margin: 32px 0; text-align: center;">
          <span style="display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: bold; color: #6D5EF7; background: #f4f3ff; padding: 16px 32px; border-radius: 12px;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">After verification, your account will be placed in the approval queue. An administrator will review and onboard you to the CRM.</p>
        <p style="color: #64748b; font-size: 14px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendApprovalEmail(
  email: string,
  name: string,
  roleLabel: string
): Promise<boolean> {
  const company = getDefaultCompanySettings().name;
  const loginUrl = `${process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:4000"}/login`;
  return sendEmail({
    to: email,
    subject: `You're approved — ${company}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #22C55E;">Welcome aboard!</h2>
        <p>Hi ${name},</p>
        <p>Great news — your account has been approved as <strong>${roleLabel}</strong>.</p>
        <p>You can now sign in and access the ${company} CRM dashboard.</p>
        <a href="${loginUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #6D5EF7; color: white; text-decoration: none; border-radius: 8px;">Sign in to CRM</a>
      </div>
    `,
  });
}

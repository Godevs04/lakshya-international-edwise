import nodemailer from "nodemailer";
import { getDefaultCompanySettings } from "@/lib/config/app-defaults";

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

  return nodemailer.createTransport({
    host,
    port: parseInt(port ?? "587", 10),
    secure: parseInt(port ?? "587", 10) === 465,
    auth: { user, pass },
  });
}

function getFromAddress(): string {
  return trim(process.env.SMTP_FROM) ?? trim(process.env.SMTP_USER) ?? getDefaultCompanySettings().email ?? "";
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("SMTP not configured in .env.local, email not sent:", params.subject);
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
    console.error("Email send failed:", error);
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

import nodemailer from "nodemailer";
import { getDefaultCompanySettings } from "@/lib/config/app-defaults";
import { getAuthUrl } from "@/lib/config/env";
import { logger } from "@/lib/logger";
import {
  getEmailBranding,
  renderEmailLayout,
  renderGreeting,
  renderMutedNote,
  renderOtpBlock,
  renderFeatureList,
  renderInfoBox,
  renderLinkFallback,
  emailButton,
  escapeHtml,
  BRAND,
} from "@/lib/services/email-templates";

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
  const company = await getEmailBranding();
  const bodyHtml = `
    ${renderGreeting(name)}
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: ${BRAND.text};">
      We received a request to reset the password associated with your ${escapeHtml(company.name)} CRM account. To proceed, please use the button below.
    </p>
    ${emailButton(resetUrl, "Reset Password")}
    ${renderLinkFallback(resetUrl)}
    ${renderMutedNote("This link is valid for <strong>1 hour</strong>. If you did not initiate this request, please disregard this email. No changes will be made to your account.")}`;

  return sendEmail({
    to: email,
    subject: `Password Reset Request — ${company.name}`,
    html: renderEmailLayout({
      company,
      preheader: "Action required: reset your CRM password",
      title: "Password Reset Request",
      subtitle: "Secure access to your enterprise dashboard",
      bodyHtml,
    }),
  });
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  verifyUrl: string
): Promise<boolean> {
  const company = await getEmailBranding();
  const bodyHtml = `
    ${renderGreeting(name)}
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: ${BRAND.text};">
      Thank you for registering with ${escapeHtml(company.name)}. To complete your account setup, please verify your email address.
    </p>
    ${emailButton(verifyUrl, "Verify Email Address")}
    ${renderLinkFallback(verifyUrl)}
    ${renderFeatureList([
      "Confirm your registered email address",
      "Proceed to secure onboarding",
      "Access your assigned CRM workspace upon approval",
    ])}
    ${renderMutedNote("If you did not register for an account, no further action is required.")}`;

  return sendEmail({
    to: email,
    subject: `Email Verification — ${company.name}`,
    html: renderEmailLayout({
      company,
      preheader: "Please verify your email address",
      title: "Email Verification",
      subtitle: "Complete your account registration",
      bodyHtml,
    }),
  });
}

export async function sendOtpEmail(
  email: string,
  name: string,
  otp: string
): Promise<boolean> {
  const company = await getEmailBranding();
  const bodyHtml = `
    ${renderGreeting(name)}
    <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.7; color: ${BRAND.text};">
      Thank you for your interest in joining ${escapeHtml(company.name)}. Please enter the verification code below to confirm your email address.
    </p>
    ${renderOtpBlock(otp)}
    ${renderFeatureList([
      "Code valid for 10 minutes only",
      "Your request will enter the admin approval queue after verification",
      "A confirmation email will be sent once your access is approved",
    ])}
    ${renderMutedNote(`For your security, never share this code with anyone. ${escapeHtml(company.name)} will never request your OTP via phone or unsolicited email.`)}`;

  return sendEmail({
    to: email,
    subject: `Verification Code — ${company.name}`,
    html: renderEmailLayout({
      company,
      preheader: `Your verification code: ${otp}`,
      title: "Email Verification",
      subtitle: "One-time verification code",
      bodyHtml,
    }),
  });
}

export async function sendApprovalEmail(
  email: string,
  name: string,
  roleLabel: string
): Promise<boolean> {
  const company = await getEmailBranding();
  const loginUrl = `${getAuthUrl()}/login`;
  const bodyHtml = `
    ${renderGreeting(name)}
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: ${BRAND.text};">
      We are pleased to inform you that your access request has been approved. Your account has been assigned the role of <strong>${escapeHtml(roleLabel)}</strong> on the ${escapeHtml(company.name)} CRM platform.
    </p>
    ${renderInfoBox("Your account is now active. You may sign in using your registered credentials.")}
    ${emailButton(loginUrl, "Sign In to CRM")}
    ${renderLinkFallback(loginUrl)}
    ${renderFeatureList([
      "Manage students, partners, and loan applications",
      "Access reports and analytics dashboards",
      "Collaborate with your consultancy team",
    ])}
    ${renderMutedNote("For assistance, please contact your system administrator or write to our support team.")}`;

  return sendEmail({
    to: email,
    subject: `Account Approved — ${company.name}`,
    html: renderEmailLayout({
      company,
      preheader: "Your CRM access has been approved",
      title: "Account Approved",
      subtitle: "Welcome to the team",
      bodyHtml,
    }),
  });
}

export async function sendFollowUpReminderEmail(params: {
  email: string;
  name: string;
  studentName: string;
  studentCode: string;
  note: string;
  dueDate: Date;
  studentUrl: string;
}): Promise<boolean> {
  const company = await getEmailBranding();
  const dueLabel = params.dueDate.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const bodyHtml = `
    ${renderGreeting(params.name)}
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: ${BRAND.text};">
      You have a student follow-up scheduled for <strong>${escapeHtml(dueLabel)}</strong>.
    </p>
    ${renderInfoBox(
      `<strong>${escapeHtml(params.studentName)}</strong> (${escapeHtml(params.studentCode)})<br/>${escapeHtml(params.note)}`
    )}
    ${emailButton(params.studentUrl, "View Student")}
    ${renderLinkFallback(params.studentUrl)}
    ${renderMutedNote("This reminder was sent automatically by your CRM follow-up scheduler.")}`;

  return sendEmail({
    to: params.email,
    subject: `Follow-up Reminder — ${params.studentName}`,
    html: renderEmailLayout({
      company,
      preheader: `Follow-up due for ${params.studentName}`,
      title: "Follow-up Reminder",
      subtitle: params.studentCode,
      bodyHtml,
    }),
  });
}

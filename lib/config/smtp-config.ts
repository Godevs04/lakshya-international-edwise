import { logger } from "@/lib/logger";

function trim(value: string | undefined): string | undefined {
  return value?.trim();
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    trim(process.env.SMTP_HOST) &&
      trim(process.env.SMTP_USER) &&
      trim(process.env.SMTP_PASS)
  );
}

export function warnIfSmtpMissing(): void {
  if (process.env.NODE_ENV === "test") return;

  if (!isSmtpConfigured()) {
    logger.warn(
      "SMTP is not fully configured (SMTP_HOST, SMTP_USER, SMTP_PASS). OTP, password reset, and approval emails will not send."
    );
  }
}

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.APP_ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error("APP_ENCRYPTION_KEY must be a 64-character hex string");
  }
  return Buffer.from(key, "hex");
}

export function encrypt(text: string): string {
  if (!text) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return "";
  const [ivHex, tagHex, dataHex] = encryptedText.split(":");
  if (!ivHex || !tagHex || !dataHex) return encryptedText;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export function maskSensitive(value: string, visibleChars = 4): string {
  if (!value || value.length <= visibleChars) return "****";
  return "*".repeat(value.length - visibleChars) + value.slice(-visibleChars);
}

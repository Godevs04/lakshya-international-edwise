import { Partner } from "@/models/Partner";
import { getStudentIdCompanyCode } from "@/lib/services/student-id.service";

const SEQUENCE_PAD = 6;

export function buildPartnerCodePrefix(code = getStudentIdCompanyCode()): string {
  return `PTR-${code}-`;
}

export function buildWebsitePartnerLeadCodePrefix(code = getStudentIdCompanyCode()): string {
  return `LEAD-PTR-${code}-`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseSequence(value: string, prefix: string): number | null {
  const match = value.match(new RegExp(`^${escapeRegExp(prefix)}(\\d+)$`));
  return match ? parseInt(match[1], 10) : null;
}

function formatCode(prefix: string, sequence: number): string {
  return `${prefix}${String(sequence).padStart(SEQUENCE_PAD, "0")}`;
}

async function allocateFromPrefix(prefix: string): Promise<string> {
  const pattern = new RegExp(`^${escapeRegExp(prefix)}\\d+$`);
  const existing = await Partner.find({ partnerCode: pattern }).select("partnerCode").lean();

  let maxSequence = 0;
  for (const { partnerCode } of existing) {
    if (!partnerCode) continue;
    const sequence = parseSequence(partnerCode, prefix);
    if (sequence !== null && sequence > maxSequence) {
      maxSequence = sequence;
    }
  }

  return formatCode(prefix, maxSequence + 1);
}

export async function allocateWebsitePartnerLeadCode(): Promise<string> {
  return allocateFromPrefix(buildWebsitePartnerLeadCodePrefix());
}

export async function allocatePartnerCode(): Promise<string> {
  return allocateFromPrefix(buildPartnerCodePrefix());
}

import { Student } from "@/models/Student";

const SEQUENCE_PAD = 6;

export function getStudentIdCompanyCode(): string {
  return process.env.APP_STUDENT_ID_CODE?.trim().toUpperCase() || "LIE";
}

export function buildStudentIdPrefix(code = getStudentIdCompanyCode()): string {
  return `STU-${code}-`;
}

export function parseStudentIdSequence(studentId: string, code = getStudentIdCompanyCode()): number | null {
  const branded = studentId.match(new RegExp(`^STU-${code}-(\\d+)$`));
  if (branded) return parseInt(branded[1], 10);

  const legacyNumeric = studentId.match(/^STU-(\d+)$/);
  if (legacyNumeric) return parseInt(legacyNumeric[1], 10);

  return null;
}

export function formatStudentId(sequence: number, code = getStudentIdCompanyCode()): string {
  return `${buildStudentIdPrefix(code)}${String(sequence).padStart(SEQUENCE_PAD, "0")}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function allocateStudentId(): Promise<string> {
  const code = getStudentIdCompanyCode();
  const brandedPattern = new RegExp(`^${escapeRegExp(buildStudentIdPrefix(code))}\\d+$`);
  const legacyPattern = /^STU-\d+$/;

  const existing = await Student.find({
    $or: [{ studentId: brandedPattern }, { studentId: legacyPattern }],
  })
    .select("studentId")
    .lean();

  let maxSequence = 0;
  for (const { studentId } of existing) {
    const sequence = parseStudentIdSequence(studentId, code);
    if (sequence !== null && sequence > maxSequence) {
      maxSequence = sequence;
    }
  }

  if (maxSequence === 0) {
    maxSequence = await Student.countDocuments();
  }

  return formatStudentId(maxSequence + 1, code);
}

export function buildWebsiteLeadIdPrefix(code = getStudentIdCompanyCode()): string {
  return `LEAD-${code}-`;
}

export function parseWebsiteLeadIdSequence(leadId: string, code = getStudentIdCompanyCode()): number | null {
  const match = leadId.match(new RegExp(`^LEAD-${code}-(\\d+)$`));
  return match ? parseInt(match[1], 10) : null;
}

export function formatWebsiteLeadId(sequence: number, code = getStudentIdCompanyCode()): string {
  return `${buildWebsiteLeadIdPrefix(code)}${String(sequence).padStart(SEQUENCE_PAD, "0")}`;
}

export async function allocateWebsiteLeadId(): Promise<string> {
  const code = getStudentIdCompanyCode();
  const pattern = new RegExp(`^${escapeRegExp(buildWebsiteLeadIdPrefix(code))}\\d+$`);

  const existing = await Student.find({ studentId: pattern }).select("studentId").lean();

  let maxSequence = 0;
  for (const { studentId } of existing) {
    const sequence = parseWebsiteLeadIdSequence(studentId, code);
    if (sequence !== null && sequence > maxSequence) {
      maxSequence = sequence;
    }
  }

  return formatWebsiteLeadId(maxSequence + 1, code);
}

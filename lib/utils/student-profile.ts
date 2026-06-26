export interface StudentProfileInput {
  phone?: string;
  whatsapp?: string;
  email?: string;
  gender?: string;
  dob?: Date | string;
  targetCountry?: string;
  targetIntake?: string;
  targetDegree?: string;
  targetUniversity?: string;
  loan?: { requested?: number; lenderId?: unknown; roi?: number };
  partnerId?: unknown;
  partnerName?: string;
}

export interface StudentProfileCompleteness {
  percent: number;
  isComplete: boolean;
  filledCount: number;
  totalCount: number;
  missingFields: string[];
}

const PROFILE_FIELD_CHECKS: Array<{ label: string; check: (student: StudentProfileInput) => boolean }> = [
  { label: "Phone", check: (s) => Boolean(s.phone?.trim() || s.whatsapp?.trim()) },
  { label: "Email", check: (s) => Boolean(s.email?.trim()) },
  { label: "Target country", check: (s) => Boolean(s.targetCountry?.trim()) },
  { label: "Target intake", check: (s) => Boolean(s.targetIntake?.trim()) },
  { label: "University", check: (s) => Boolean(s.targetUniversity?.trim()) },
  { label: "Loan amount", check: (s) => (s.loan?.requested ?? 0) > 0 },
  { label: "Lender", check: (s) => Boolean(s.loan?.lenderId) },
  { label: "Partner", check: (s) => Boolean(s.partnerId || s.partnerName?.trim()) },
];

export const PROFILE_COMPLETE_THRESHOLD = 85;

export function getStudentProfileCompleteness(
  student: StudentProfileInput
): StudentProfileCompleteness {
  const missingFields: string[] = [];

  for (const field of PROFILE_FIELD_CHECKS) {
    if (!field.check(student)) {
      missingFields.push(field.label);
    }
  }

  const filledCount = PROFILE_FIELD_CHECKS.length - missingFields.length;
  const totalCount = PROFILE_FIELD_CHECKS.length;
  const percent = totalCount ? Math.round((filledCount / totalCount) * 100) : 0;

  return {
    percent,
    isComplete: percent >= PROFILE_COMPLETE_THRESHOLD,
    filledCount,
    totalCount,
    missingFields,
  };
}

export function isStudentProfileVerified(student: StudentProfileInput): boolean {
  return getStudentProfileCompleteness(student).isComplete;
}

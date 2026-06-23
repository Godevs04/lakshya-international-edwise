import { STUDENT_DOCUMENT_CHECKLIST } from "@/lib/constants/student-document-checklist";

export interface StudentDocumentInput {
  name: string;
}

export interface DocumentChecklistEntry {
  id: string;
  label: string;
  uploaded: boolean;
  matchedDocumentName?: string;
}

export interface DocumentChecklistProgress {
  uploaded: number;
  total: number;
  percent: number;
  items: DocumentChecklistEntry[];
}

export interface StudentProfileInput {
  phone?: string;
  whatsapp?: string;
  email?: string;
  gender?: string;
  dob?: Date | string;
  targetCountry?: string;
  targetIntake?: string;
  targetDegree?: string;
  address?: { city?: string; state?: string; pincode?: string };
  education?: { college?: string; course?: string; year?: string };
  loan?: { requested?: number; bankName?: string };
  partnerId?: unknown;
  partnerName?: string;
  documents?: StudentDocumentInput[];
  hasAadhaar?: boolean;
  hasPan?: boolean;
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
  { label: "Gender", check: (s) => Boolean(s.gender?.trim()) },
  { label: "Date of birth", check: (s) => Boolean(s.dob) },
  { label: "Target country", check: (s) => Boolean(s.targetCountry?.trim()) },
  { label: "Target intake", check: (s) => Boolean(s.targetIntake?.trim()) },
  { label: "Target degree", check: (s) => Boolean(s.targetDegree?.trim()) },
  { label: "City", check: (s) => Boolean(s.address?.city?.trim()) },
  { label: "State", check: (s) => Boolean(s.address?.state?.trim()) },
  { label: "College", check: (s) => Boolean(s.education?.college?.trim()) },
  { label: "Course", check: (s) => Boolean(s.education?.course?.trim()) },
  { label: "Loan amount", check: (s) => (s.loan?.requested ?? 0) > 0 },
  { label: "Bank name", check: (s) => Boolean(s.loan?.bankName?.trim()) },
  {
    label: "Partner",
    check: (s) => Boolean(s.partnerId || s.partnerName?.trim()),
  },
  { label: "Aadhaar", check: (s) => Boolean(s.hasAadhaar) },
  { label: "PAN", check: (s) => Boolean(s.hasPan) },
];

export const PROFILE_COMPLETE_THRESHOLD = 85;
export const DOCUMENT_COMPLETE_THRESHOLD = 50;

function normalizeDocumentName(name: string): string {
  return name.trim().toLowerCase();
}

export function documentMatchesChecklistItem(
  documentName: string,
  keywords: string[]
): boolean {
  const normalized = normalizeDocumentName(documentName);
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

export function getDocumentChecklistProgress(
  documents: StudentDocumentInput[] = []
): DocumentChecklistProgress {
  const items = STUDENT_DOCUMENT_CHECKLIST.map((item) => {
    const matched = documents.find((doc) =>
      documentMatchesChecklistItem(doc.name, item.keywords)
    );

    return {
      id: item.id,
      label: item.label,
      uploaded: Boolean(matched),
      matchedDocumentName: matched?.name,
    };
  });

  const uploaded = items.filter((item) => item.uploaded).length;
  const total = items.length;

  return {
    uploaded,
    total,
    percent: total ? Math.round((uploaded / total) * 100) : 0,
    items,
  };
}

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

export function isStudentProfileVerified(
  student: StudentProfileInput,
  documents: StudentDocumentInput[] = student.documents ?? []
): boolean {
  const profile = getStudentProfileCompleteness(student);
  const documentsProgress = getDocumentChecklistProgress(documents);

  return (
    profile.isComplete && documentsProgress.percent >= DOCUMENT_COMPLETE_THRESHOLD
  );
}

export type StudentEditSectionKey = "profile" | "loan";

export const STUDENT_EDIT_SECTIONS: Record<
  StudentEditSectionKey,
  { label: string; formSections: string[]; scrollTarget: string }
> = {
  profile: {
    label: "Student profile",
    formSections: ["onboarding", "personal", "study-abroad"],
    scrollTarget: "section-onboarding",
  },
  loan: {
    label: "Loan & application",
    formSections: ["loan"],
    scrollTarget: "section-loan",
  },
};

export function parseStudentEditSection(
  value?: string | null
): StudentEditSectionKey | undefined {
  if (!value) return undefined;
  return value in STUDENT_EDIT_SECTIONS ? (value as StudentEditSectionKey) : undefined;
}

export function getStudentEditHref(studentId: string, section: StudentEditSectionKey) {
  return `/dashboard/students/${studentId}/edit?section=${section}`;
}

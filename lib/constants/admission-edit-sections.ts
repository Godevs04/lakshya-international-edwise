export type AdmissionEditSectionKey = "profile" | "study" | "assignment" | "revenue";

export const ADMISSION_EDIT_SECTIONS: Record<
  AdmissionEditSectionKey,
  { label: string; formSections: string[]; scrollTarget: string }
> = {
  profile: {
    label: "Student profile",
    formSections: ["profile"],
    scrollTarget: "section-profile",
  },
  study: {
    label: "Study abroad",
    formSections: ["study"],
    scrollTarget: "section-study",
  },
  assignment: {
    label: "Assignment",
    formSections: ["assignment"],
    scrollTarget: "section-assignment",
  },
  revenue: {
    label: "Admission revenue",
    formSections: ["revenue"],
    scrollTarget: "section-revenue",
  },
};

export function parseAdmissionEditSection(
  value?: string | null
): AdmissionEditSectionKey | undefined {
  if (!value) return undefined;
  return value in ADMISSION_EDIT_SECTIONS ? (value as AdmissionEditSectionKey) : undefined;
}

export function getAdmissionEditHref(admissionId: string, section: AdmissionEditSectionKey) {
  return `/dashboard/admissions/${admissionId}/edit?section=${section}`;
}

export function getAdmissionDetailHref(admissionId: string) {
  return `/dashboard/admissions/${admissionId}`;
}

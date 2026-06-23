export interface StudentListFilters {
  page?: string;
  search?: string;
  status?: string;
  stage?: string;
  mine?: string;
  partnerId?: string;
  assignedToId?: string;
  targetCountry?: string;
  targetIntake?: string;
  dateFrom?: string;
  dateTo?: string;
  loanMin?: string;
  loanMax?: string;
  state?: string;
  college?: string;
  course?: string;
  bank?: string;
}

const FILTER_KEYS: (keyof StudentListFilters)[] = [
  "page",
  "search",
  "status",
  "stage",
  "mine",
  "partnerId",
  "assignedToId",
  "targetCountry",
  "targetIntake",
  "dateFrom",
  "dateTo",
  "loanMin",
  "loanMax",
  "state",
  "college",
  "course",
  "bank",
];

export function buildStudentListQuery(
  filters: StudentListFilters,
  overrides: Partial<StudentListFilters> = {}
): string {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();

  for (const key of FILTER_KEYS) {
    const value = merged[key]?.trim();
    if (value) params.set(key, value);
  }

  return params.toString();
}

export function countActiveAdvancedFilters(filters: StudentListFilters): number {
  const advancedKeys: (keyof StudentListFilters)[] = [
    "partnerId",
    "assignedToId",
    "targetCountry",
    "targetIntake",
    "dateFrom",
    "dateTo",
    "loanMin",
    "loanMax",
    "state",
    "college",
    "course",
    "bank",
    "status",
  ];

  return advancedKeys.filter((key) => Boolean(filters[key]?.trim())).length;
}

export function hasActiveListFilters(filters: StudentListFilters): boolean {
  return FILTER_KEYS.some((key) => key !== "page" && Boolean(filters[key]?.trim()));
}

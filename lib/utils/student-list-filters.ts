import { STUDENT_STATUSES } from "@/lib/constants/statuses";

const VALID_STATUSES = new Set<string>(STUDENT_STATUSES);

export function parseStatusFilter(value?: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => VALID_STATUSES.has(entry));
}

export function serializeStatusFilter(statuses: string[]): string | undefined {
  const valid = statuses.filter((entry) => VALID_STATUSES.has(entry));
  return valid.length > 0 ? valid.join(",") : undefined;
}

export interface StudentListFilters {
  page?: string;
  search?: string;
  status?: string;
  workflow?: string;
  lenderId?: string;
  mine?: string;
  partnerId?: string;
  assignedToId?: string;
  targetCountry?: string;
  targetIntake?: string;
  dateFrom?: string;
  dateTo?: string;
  loanMin?: string;
  loanMax?: string;
  gender?: string;
}

const FILTER_KEYS: (keyof StudentListFilters)[] = [
  "page",
  "search",
  "status",
  "workflow",
  "lenderId",
  "mine",
  "partnerId",
  "assignedToId",
  "targetCountry",
  "targetIntake",
  "dateFrom",
  "dateTo",
  "loanMin",
  "loanMax",
  "gender",
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
    "gender",
    "status",
    "lenderId",
  ];

  return advancedKeys.filter((key) => {
    if (key === "status") return parseStatusFilter(filters.status).length > 0;
    return Boolean(filters[key]?.trim());
  }).length;
}

export function hasActiveListFilters(filters: StudentListFilters): boolean {
  return FILTER_KEYS.some((key) => key !== "page" && Boolean(filters[key]?.trim()));
}

import type { StudentStatus, PartnerStatus, ApplicationStatus } from "@/lib/constants/statuses";
import type { PartnerActionStatus } from "@/lib/constants/partner-action-statuses";

export type UserRole =
  | "super_admin"
  | "admin"
  | "manager"
  | "staff"
  | "viewer";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  avatar?: string;
}

export interface Address {
  line?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface Education {
  college?: string;
  course?: string;
  year?: string;
}

export interface LoanDetails {
  requested?: number;
  sanctioned?: number;
  disbursed?: number;
  interest?: number;
  bankName?: string;
  applicationNumber?: string;
}

export interface DocumentFile {
  _id?: string;
  name: string;
  url: string;
  publicId: string;
  mimeType: string;
  uploadedBy?: string;
  uploadedAt?: Date;
}

export interface TimelineEntry {
  _id?: string;
  status: StudentStatus;
  note?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt?: Date;
}

export interface NoteEntry {
  _id?: string;
  content: string;
  createdBy?: string;
  createdByName?: string;
  dueDate?: Date;
  createdAt?: Date;
}

export interface BankDetails {
  accountName?: string;
  accountNumber?: string;
  ifsc?: string;
  bankName?: string;
}

export interface AppTheme {
  primary: string;
  accent: string;
  radius: string;
  fontFamily: string;
  mode: "light" | "dark" | "system";
}

export interface AppModules {
  students: boolean;
  partners: boolean;
  applications: boolean;
  lenders: boolean;
  tasks: boolean;
  reports: boolean;
  analytics: boolean;
}

export interface CompanySettings {
  name: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface AppSettings {
  company: CompanySettings;
  theme: AppTheme;
  modules: AppModules;
  sessionExpiryHours: number;
}

export interface DashboardMetrics {
  totalStudents: number;
  newStudentsToday: number;
  totalPartners: number;
  pendingApplications: number;
  sanctioned: number;
  disbursed: number;
  rejected: number;
  totalLoanAmount: number;
  todaysCollection: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
  key?: string;
  loanMin?: number;
  loanMax?: number;
}

export interface ActivityItem {
  _id: string;
  action: string;
  description: string;
  resourceType: string;
  resourceId?: string;
  userName?: string;
  createdAt: Date;
}

export interface SearchResult {
  type: "student" | "partner" | "application";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export interface StudentListItem {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  status: StudentStatus;
  partnerName?: string;
  assigneeName?: string;
  targetCountry?: string;
  targetIntake?: string;
  targetDegree?: string;
  loanRequested?: number;
  profileVerified?: boolean;
  documentsCount?: number;
  createdAt: Date;
}

export interface PartnerListItem {
  _id: string;
  companyName: string;
  owner?: string;
  phone?: string;
  email?: string;
  status: PartnerStatus;
  actionStatus: PartnerActionStatus;
  studentsCount: number;
  totalLoanValue: number;
  commissionPercent?: number;
}

export interface ApplicationListItem {
  _id: string;
  studentId: string;
  studentName: string;
  partnerName?: string;
  loanAmount: number;
  status: ApplicationStatus;
  priority?: string;
  dueDate?: Date;
  createdAt: Date;
}

export interface TaskListItem {
  _id: string;
  title: string;
  description?: string;
  studentId?: string;
  studentCode?: string;
  studentName?: string;
  assignedToId?: string;
  assignedToName?: string;
  createdByName?: string;
  dueAt: Date;
  reminderAt?: Date;
  status: "open" | "done" | "cancelled";
  isOverdue?: boolean;
  createdAt: Date;
}

export interface LenderListItem {
  _id: string;
  name: string;
  slug: string;
  applicationCount: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

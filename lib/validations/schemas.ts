import { z } from "zod";
import {
  isBlank,
  isValidAadhaar,
  isValidIfsc,
  isValidIndianPhone,
  isValidPan,
  isValidPincode,
} from "@/lib/validations/indian-fields";

function refineIndianFields(
  data: {
    phone?: string;
    whatsapp?: string;
    pincode?: string;
    aadhaar?: string;
    pan?: string;
    ifsc?: string;
  },
  ctx: z.RefinementCtx
) {
  if (!isBlank(data.phone) && !isValidIndianPhone(data.phone!)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Phone must be a valid 10-digit Indian mobile number",
      path: ["phone"],
    });
  }
  if (!isBlank(data.whatsapp) && !isValidIndianPhone(data.whatsapp!)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "WhatsApp must be a valid 10-digit Indian mobile number",
      path: ["whatsapp"],
    });
  }
  if (!isBlank(data.pincode) && !isValidPincode(data.pincode!)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Pincode must be exactly 6 digits",
      path: ["pincode"],
    });
  }
  if (!isBlank(data.aadhaar) && !isValidAadhaar(data.aadhaar!)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Aadhaar must be exactly 12 digits (numbers only)",
      path: ["aadhaar"],
    });
  }
  if (!isBlank(data.pan) && !isValidPan(data.pan!)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "PAN must be 10 characters: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)",
      path: ["pan"],
    });
  }
  if (!isBlank(data.ifsc) && !isValidIfsc(data.ifsc!)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "IFSC must be 11 characters (e.g. SBIN0001234)",
      path: ["ifsc"],
    });
  }
}

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const studentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female", "other", ""]).optional(),
  dob: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  addressLine: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  aadhaar: z.string().optional(),
  pan: z.string().optional(),
  college: z.string().optional(),
  course: z.string().optional(),
  year: z.string().optional(),
  loanRequested: z.coerce.number().min(0).optional(),
  loanSanctioned: z.coerce.number().min(0).optional(),
  loanDisbursed: z.coerce.number().min(0).optional(),
  interest: z.coerce.number().min(0).max(100).optional(),
  bankName: z.string().optional(),
  applicationNumber: z.string().max(50).optional(),
  partnerId: z.string().optional(),
  status: z.enum([
    "new", "contacted", "documents_pending", "submitted",
    "under_verification", "approved", "sanctioned", "disbursed", "rejected", "closed",
  ]).optional(),
  remarks: z.string().optional(),
  photo: z.string().optional(),
}).superRefine((data, ctx) => {
  refineIndianFields(data, ctx);
});

export const partnerSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  owner: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  gst: z.string().optional(),
  commissionPercent: z.coerce
    .number()
    .min(0, "Commission cannot be negative")
    .max(100, "Commission cannot exceed 100%")
    .optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifsc: z.string().optional(),
  bankName: z.string().optional(),
  status: z.enum(["active", "inactive", "pending", "suspended"]).optional(),
  photo: z.string().optional(),
  companyLogo: z.string().optional(),
  agreementUrl: z.string().optional(),
}).superRefine((data, ctx) => {
  refineIndianFields(data, ctx);
});

export const noteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
  dueDate: z.string().optional(),
});

export const commissionSettlementSchema = z.object({
  amount: z.coerce.number().positive("Settlement amount must be greater than zero"),
  note: z.string().max(500).optional(),
});

export const settingsSchema = z.object({
  companyName: z.string().min(1),
  companyEmail: z.string().email().optional().or(z.literal("")),
  companyPhone: z.string().optional(),
  companyAddress: z.string().optional(),
  companyLogo: z.string().optional(),
  modulesStudents: z.boolean().optional(),
  modulesPartners: z.boolean().optional(),
  modulesApplications: z.boolean().optional(),
  modulesReports: z.boolean().optional(),
  modulesAnalytics: z.boolean().optional(),
  sessionExpiryHours: z.coerce.number().min(1).max(720).optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
  confirmPassword: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type PartnerInput = z.infer<typeof partnerSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;

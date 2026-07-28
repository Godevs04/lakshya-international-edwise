import { z } from "zod";
import {
  SUPPORT_ADMISSION_STATUSES,
  SUPPORT_COLLATERAL_PREFERENCES,
  SUPPORT_CONVERSATION_STATUSES,
} from "@/lib/constants/support";
import { isValidIndianPhone } from "@/lib/validations/indian-fields";

export const supportFaqSearchSchema = z.object({
  query: z.string().trim().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

export const supportQualifySchema = z
  .object({
    visitorId: z.string().uuid(),
    name: z.string().trim().min(2).max(100),
    phone: z.string().trim().min(10).max(15),
    email: z.string().trim().email().optional().or(z.literal("")),
    country: z.string().trim().min(2).max(80),
    degree: z.string().trim().min(2).max(80),
    admissionStatus: z.enum(SUPPORT_ADMISSION_STATUSES),
    collateralPreference: z.enum(SUPPORT_COLLATERAL_PREFERENCES),
    loanRequired: z.coerce.boolean().default(true),
    website: z.string().max(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (!isValidIndianPhone(data.phone)) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Enter a valid 10-digit Indian mobile number",
      });
    }
  });

export const supportSendMessageSchema = z.object({
  conversationId: z.string().min(1),
  visitorId: z.string().uuid().optional(),
  body: z.string().trim().min(1).max(4000),
  type: z.enum(["text", "image", "file"]).default("text"),
});

export const supportAssignSchema = z.object({
  conversationId: z.string().min(1),
  assigneeId: z.string().min(1).optional(),
});

export const supportCloseSchema = z.object({
  conversationId: z.string().min(1),
  status: z.enum(["resolved", "closed"]).default("resolved"),
});

export const supportListSchema = z.object({
  status: z.enum([...SUPPORT_CONVERSATION_STATUSES, "all"]).default("waiting"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

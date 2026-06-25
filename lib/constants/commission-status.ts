import type { z } from "zod";
import { commissionStatusFilterSchema } from "@/lib/validations/schemas";

export type CommissionStatusFilter = z.infer<typeof commissionStatusFilterSchema>;

export const COMMISSION_STATUS_FILTER_OPTIONS: Array<{
  value: CommissionStatusFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "received_pending", label: "Pending Received" },
  { value: "received_partial", label: "Partially Received" },
  { value: "received_complete", label: "Received Complete" },
  { value: "shared_pending", label: "Pending Paid" },
  { value: "shared_partial", label: "Partially Paid" },
  { value: "shared_complete", label: "Paid Complete" },
  { value: "fully_complete", label: "Fully Complete" },
];

"use client";

import { GlassCard } from "@/components/cards/glass-card";
import { COMMISSION_STATUS_FILTER_OPTIONS } from "@/lib/constants/commission-status";

export function CommissionModelNotice() {
  return (
    <GlassCard className="border-[#0369A1]/30 bg-[#0369A1]/5 p-4 text-sm text-muted-foreground">
      Commission amounts calculate automatically from disbursement and rates. Only{" "}
      <strong>Received</strong> (from lender) and <strong>Paid</strong> (to partner) need to be
      marked by your team.
    </GlassCard>
  );
}

export { COMMISSION_STATUS_FILTER_OPTIONS };

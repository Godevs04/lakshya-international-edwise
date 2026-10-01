"use client";

import { GlassCard } from "@/components/cards/glass-card";
import { COMMISSION_STATUS_FILTER_OPTIONS } from "@/lib/constants/commission-status";

export function CommissionModelNotice() {
  return (
    <GlassCard className="border-[#0369A1]/30 bg-[#0369A1]/5 p-4 text-sm text-muted-foreground">
      Commission amounts calculate automatically from disbursement and rates, including{" "}
      <strong>2% TDS</strong> on partner share. On each student row, enter the cash you paid. That
      amount is saved as <strong>Paid</strong> after 2% TDS. <strong>Final net</strong> stays the
      share before that deduction, unless you keep part of the net payable. The action then shows{" "}
      <strong>Completed</strong>.
    </GlassCard>
  );
}

export { COMMISSION_STATUS_FILTER_OPTIONS };

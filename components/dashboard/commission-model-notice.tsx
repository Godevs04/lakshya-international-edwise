"use client";

import { GlassCard } from "@/components/cards/glass-card";
import { COMMISSION_STATUS_FILTER_OPTIONS } from "@/lib/constants/commission-status";

export function CommissionModelNotice() {
  return (
    <GlassCard className="border-[#0369A1]/30 bg-[#0369A1]/5 p-4 text-sm text-muted-foreground">
      Commission amounts calculate automatically from disbursement and rates, including{" "}
      <strong>2% TDS</strong> on partner share. On each student row, enter the cash you paid. That
      amount is saved as both <strong>Paid</strong> and <strong>Final net</strong>, then the action
      shows <strong>Completed</strong>.
    </GlassCard>
  );
}

export { COMMISSION_STATUS_FILTER_OPTIONS };

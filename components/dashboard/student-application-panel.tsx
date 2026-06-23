"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/cards/glass-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import {
  APPLICATION_STATUS_OPTIONS,
  getApplicationStatusLabel,
  type ApplicationStatusId,
} from "@/lib/constants/application-status";
import {
  markStudentSentToBankAction,
  updateStudentApplicationStatusAction,
} from "@/lib/actions/student.actions";
import { LenderLogo } from "@/components/lenders/lender-logo";
import { Send } from "lucide-react";

interface StudentApplicationPanelProps {
  studentId: string;
  canWrite?: boolean;
  applicationStatus: ApplicationStatusId;
  sentToBank?: boolean;
  sentToBankAt?: Date;
  sentToBankByName?: string;
  lenderName?: string;
  lenderSlug?: string;
  applicationNumber?: string;
  latestRemark?: string;
  loan?: {
    requested?: number;
    sanctioned?: number;
    disbursed?: number;
    currency?: "INR" | "USD";
    roi?: number;
    interest?: number;
    processingFee?: number;
    pfPaid?: boolean;
  };
  onSentToBank?: (data: { sentToBankAt: Date; sentToBankByName?: string }) => void;
}

function formatLoanAmount(amount: number, currency?: "INR" | "USD") {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return formatCurrency(amount);
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border bg-white/50 p-4 dark:bg-white/5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value?.trim() ? value : "—"}</p>
    </div>
  );
}

export function StudentApplicationPanel({
  studentId,
  canWrite = false,
  applicationStatus,
  sentToBank,
  sentToBankAt,
  sentToBankByName,
  lenderName,
  lenderSlug,
  applicationNumber,
  latestRemark,
  loan,
  onSentToBank,
}: StudentApplicationPanelProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatusId>(applicationStatus);
  const [statusLoading, setStatusLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  const statusItems = APPLICATION_STATUS_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  async function handleStatusChange(nextStatus: ApplicationStatusId) {
    setStatus(nextStatus);
    setStatusLoading(true);
    const result = await updateStudentApplicationStatusAction(studentId, nextStatus);
    if (result.success) {
      notify.success("Application status updated");
      router.refresh();
    } else {
      setStatus(applicationStatus);
      notify.error(result.error ?? "Failed to update application status");
    }
    setStatusLoading(false);
  }

  async function handleSendToBank() {
    setSendLoading(true);
    const result = await markStudentSentToBankAction(studentId);
    if (result.success && result.data) {
      const sentAt = new Date(result.data.sentToBankAt);
      onSentToBank?.({
        sentToBankAt: sentAt,
        sentToBankByName: result.data.sentToBankByName,
      });
      notify.success("Marked as sent to bank");
      router.refresh();
    } else if (result.success) {
      onSentToBank?.({ sentToBankAt: new Date() });
      notify.success("Marked as sent to bank");
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to update send-to-bank status");
    }
    setSendLoading(false);
  }

  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-5">
            <LenderLogo slug={lenderSlug} name={lenderName} size="xl" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Lender Application
              </p>
              <h3 className="mt-1 text-lg font-bold">{lenderName ?? "No lender assigned"}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {applicationNumber ? (
                  <Badge className="bg-[#1E3A8A] px-3 py-1 font-mono text-white hover:bg-[#1E3A8A]">
                    LAN {applicationNumber}
                  </Badge>
                ) : (
                  <Badge variant="outline">LAN not assigned</Badge>
                )}
                {sentToBank ? (
                  <Badge className="bg-[#22C55E]/15 text-[#22C55E] hover:bg-[#22C55E]/15">
                    Sent to bank
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          {canWrite ? (
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[220px]">
              <Button
                type="button"
                onClick={handleSendToBank}
                disabled={sendLoading || sentToBank}
                className="w-full"
              >
                <Send className="mr-1.5 h-4 w-4" />
                {sentToBank ? "Already sent to bank" : sendLoading ? "Saving..." : "Send to Bank"}
              </Button>
              {sentToBank && sentToBankAt ? (
                <p className="text-xs text-muted-foreground">
                  {sentToBankByName ?? "Team"} · {formatDateTime(sentToBankAt)}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {sentToBank ? (
          <div className="mt-4 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#16A34A]">
              Bank submission recorded
            </p>
            <p className="mt-1 text-sm text-foreground">
              This application was marked as sent to {lenderName ?? "the lender"}
              {sentToBankAt ? ` on ${formatDateTime(sentToBankAt)}` : ""}
              {sentToBankByName ? ` by ${sentToBankByName}` : ""}.
            </p>
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 border-t pt-5 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Latest Remarks
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              {latestRemark?.trim() ? latestRemark : "Not available"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Application Status
            </p>
            {canWrite ? (
              <Select
                value={status}
                onValueChange={(value) => handleStatusChange(value as ApplicationStatusId)}
                items={statusItems}
              >
                <SelectTrigger className="w-full" disabled={statusLoading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-semibold">{getApplicationStatusLabel(status)}</p>
            )}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="mb-4 text-base font-bold">Loan Details</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DetailItem
            label="Loan amount requested"
            value={formatLoanAmount(loan?.requested ?? 0, loan?.currency)}
          />
          <DetailItem label="Loan type" value="Education loan" />
          <DetailItem
            label="Sanctioned amount"
            value={formatLoanAmount(loan?.sanctioned ?? 0, loan?.currency)}
          />
          <DetailItem
            label="Disbursed amount"
            value={formatLoanAmount(loan?.disbursed ?? 0, loan?.currency)}
          />
          <DetailItem label="Currency" value={loan?.currency ?? "INR"} />
          <DetailItem
            label="ROI"
            value={loan?.roi != null && loan.roi > 0 ? `${loan.roi}%` : undefined}
          />
          <DetailItem
            label="Processing fee"
            value={formatLoanAmount(loan?.processingFee ?? 0, loan?.currency)}
          />
          <DetailItem
            label="PF status"
            value={loan?.pfPaid ? "Paid" : loan?.processingFee ? "Pending" : "Not applicable"}
          />
          <DetailItem
            label="Interest"
            value={loan?.interest != null && loan.interest > 0 ? `${loan.interest}%` : undefined}
          />
        </div>
      </GlassCard>
    </div>
  );
}

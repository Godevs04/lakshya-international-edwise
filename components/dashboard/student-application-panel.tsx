"use client";

import { useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/utils/format";
import {
  APPLICATION_STATUS_OPTIONS,
  getApplicationStatusLabel,
  type ApplicationStatusId,
} from "@/lib/constants/application-status";
import {
  addStudentLoanApplicationAction,
  rejectLoanApplicationAction,
  sendLoanApplicationToBankAction,
  setStudentPrimaryLenderAction,
  updateLoanApplicationLanAction,
  updateLoanApplicationStatusAction,
} from "@/lib/actions/student.actions";
import { useLenderOptions } from "@/components/lenders/use-lender-options";
import type { LenderOption } from "@/types";
import type { LoanApplicationItem } from "@/lib/constants/loan-application";
import { LenderLogo } from "@/components/lenders/lender-logo";
import { Pencil, Plus, Send, XCircle } from "lucide-react";

interface StudentApplicationPanelProps {
  studentId: string;
  canWrite?: boolean;
  loanApplications: LoanApplicationItem[];
  onBankActivity?: () => void;
  lenderOptions?: LenderOption[];
}

function BankApplicationCard({
  studentId,
  application,
  canWrite,
  onUpdated,
  lenderLogo,
  lenderAccent,
}: {
  studentId: string;
  application: LoanApplicationItem;
  canWrite: boolean;
  onUpdated: () => void;
  lenderLogo?: string;
  lenderAccent?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatusId>(application.applicationStatus);
  const [statusLoading, setStatusLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [lan, setLan] = useState(application.applicationNumber ?? "");
  const [lanLoading, setLanLoading] = useState(false);
  const [editingLan, setEditingLan] = useState(false);
  const [sent, setSent] = useState(application.sentToBank);
  const [sentAt, setSentAt] = useState(application.sentToBankAt);
  const [sentBy, setSentBy] = useState(application.sentToBankByName);

  const statusItems = APPLICATION_STATUS_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  async function handleStatusChange(nextStatus: ApplicationStatusId) {
    setStatus(nextStatus);
    setStatusLoading(true);
    const result = await updateLoanApplicationStatusAction(studentId, application._id, nextStatus);
    if (result.success) {
      notify.success("Application status updated");
      onUpdated();
      router.refresh();
    } else {
      setStatus(application.applicationStatus);
      notify.error(result.error ?? "Failed to update application status");
    }
    setStatusLoading(false);
  }

  async function handleSendToBank() {
    setSendLoading(true);
    const result = await sendLoanApplicationToBankAction(studentId, application._id);
    if (result.success && result.data) {
      setSent(true);
      setSentAt(result.data.sentToBankAt);
      setSentBy(result.data.sentToBankByName);
      notify.success(`Sent to ${result.data.lenderName ?? application.lenderName ?? "bank"}`);
      onUpdated();
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to send application to bank");
    }
    setSendLoading(false);
  }

  async function handleReject() {
    setRejectLoading(true);
    const result = await rejectLoanApplicationAction(studentId, application._id, rejectNote);
    if (result.success) {
      setStatus("rejected");
      setShowRejectForm(false);
      setRejectNote("");
      notify.success("Rejection recorded");
      onUpdated();
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to record rejection");
    }
    setRejectLoading(false);
  }

  async function handleSaveLan() {
    setLanLoading(true);
    const result = await updateLoanApplicationLanAction(studentId, application._id, lan);
    if (result.success) {
      notify.success("LAN updated");
      setEditingLan(false);
      onUpdated();
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to update LAN");
    }
    setLanLoading(false);
  }

  return (
    <div className="rounded-xl border p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-4">
          <LenderLogo
            slug={application.lenderSlug}
            name={application.lenderName}
            logo={lenderLogo}
            accent={lenderAccent}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-bold">{application.lenderName ?? "Unknown lender"}</h4>
              {application.isPrimary ? (
                <Badge variant="outline" className="text-xs">
                  Primary
                </Badge>
              ) : null}
              {sent ? (
                <Badge className="bg-[#22C55E]/15 text-[#22C55E] hover:bg-[#22C55E]/15">
                  Sent to bank
                </Badge>
              ) : null}
              {application.applicationStatus === "rejected" ? (
                <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/15">
                  Rejected
                </Badge>
              ) : null}
            </div>

            <div className="mt-2 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Bank LAN
              </p>
              {canWrite && editingLan ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    value={lan}
                    onChange={(event) => setLan(event.target.value)}
                    placeholder="Enter bank LAN"
                    className="h-9 max-w-xs font-mono text-sm"
                  />
                  <Button type="button" size="sm" onClick={handleSaveLan} disabled={lanLoading}>
                    {lanLoading ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setLan(application.applicationNumber ?? "");
                      setEditingLan(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : application.applicationNumber ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-[#1E3A8A] px-3 py-1 font-mono text-white hover:bg-[#1E3A8A]">
                    LAN {application.applicationNumber}
                  </Badge>
                  {canWrite ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2"
                      onClick={() => setEditingLan(true)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">LAN not assigned</Badge>
                  {canWrite ? (
                    <Button type="button" size="sm" variant="outline" onClick={() => setEditingLan(true)}>
                      Add LAN
                    </Button>
                  ) : null}
                </div>
              )}
            </div>

            {sent && sentAt ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {sentBy ?? "Team"} · {formatDateTime(sentAt)}
              </p>
            ) : null}
            {application.rejectedAt ? (
              <p className="mt-1 text-xs text-destructive">
                Rejected {formatDateTime(application.rejectedAt)}
                {application.rejectedByName ? ` by ${application.rejectedByName}` : ""}
                {application.rejectionNote ? ` — ${application.rejectionNote}` : ""}
              </p>
            ) : null}
          </div>
        </div>

        {canWrite ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[220px]">
            {!sent ? (
              <Button
                type="button"
                onClick={handleSendToBank}
                disabled={sendLoading}
                className="w-full"
              >
                <Send className="mr-1.5 h-4 w-4" />
                {sendLoading ? "Saving..." : "Send to Bank"}
              </Button>
            ) : null}
            {application.applicationStatus !== "rejected" ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRejectForm((current) => !current)}
                className="w-full"
              >
                <XCircle className="mr-1.5 h-4 w-4" />
                Mark rejected
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {showRejectForm && canWrite ? (
        <div className="mt-4 space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <Input
            placeholder="Rejection reason (optional)"
            value={rejectNote}
            onChange={(event) => setRejectNote(event.target.value)}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleReject}
              disabled={rejectLoading}
            >
              {rejectLoading ? "Saving..." : "Confirm rejection"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowRejectForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-4 border-t pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Application Status
        </p>
        <div className="mt-2 max-w-xs">
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
    </div>
  );
}

export function StudentApplicationPanel({
  studentId,
  canWrite = false,
  loanApplications,
  onBankActivity,
  lenderOptions: initialLenderOptions,
}: StudentApplicationPanelProps) {
  const router = useRouter();
  const { options: lenderOptions } = useLenderOptions(initialLenderOptions);
  const [primaryLoading, setPrimaryLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  const primaryApplication = useMemo(
    () => loanApplications.find((entry) => entry.isPrimary) ?? loanApplications[0],
    [loanApplications]
  );

  const usedLenderSlugs = useMemo(
    () => new Set(loanApplications.map((entry) => entry.lenderSlug).filter(Boolean)),
    [loanApplications]
  );

  const availableLenders = useMemo(
    () => lenderOptions.filter((lender) => !usedLenderSlugs.has(lender.slug)),
    [lenderOptions, usedLenderSlugs]
  );

  const lenderVisualsBySlug = useMemo(
    () => new Map(lenderOptions.map((lender) => [lender.slug, lender])),
    [lenderOptions]
  );

  async function handlePrimaryLenderChange(lenderSlug: string | null) {
    if (!lenderSlug) return;
    setPrimaryLoading(true);
    const result = await setStudentPrimaryLenderAction(studentId, lenderSlug);
    if (result.success) {
      notify.success("Primary lender updated");
      onBankActivity?.();
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to update primary lender");
    }
    setPrimaryLoading(false);
  }

  async function handleAddBank(lenderSlug: string | null) {
    if (!lenderSlug) return;
    setAddLoading(true);
    const result = await addStudentLoanApplicationAction(studentId, lenderSlug);
    if (result.success) {
      notify.success("Bank application added");
      onBankActivity?.();
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to add bank application");
    }
    setAddLoading(false);
  }

  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2 lg:min-w-[260px]">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Primary lender
            </p>
            {canWrite ? (
              <Select
                value={primaryApplication?.lenderSlug ?? ""}
                onValueChange={handlePrimaryLenderChange}
                items={lenderOptions.map((lender) => ({
                  value: lender.slug,
                  label: lender.name,
                }))}
              >
                <SelectTrigger className="w-full" disabled={primaryLoading}>
                  <SelectValue placeholder="Select lender" />
                </SelectTrigger>
                <SelectContent>
                  {lenderOptions.map((lender) => (
                    <SelectItem key={lender.slug} value={lender.slug}>
                      {lender.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-semibold">
                {primaryApplication?.lenderName ?? "No lender assigned"}
              </p>
            )}
          </div>

          {canWrite && availableLenders.length > 0 ? (
            <div className="space-y-2 lg:min-w-[260px]">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Add parallel bank
              </p>
              <Select
                value=""
                onValueChange={handleAddBank}
                items={availableLenders.map((lender) => ({
                  value: lender.slug,
                  label: lender.name,
                }))}
              >
                <SelectTrigger className="w-full" disabled={addLoading}>
                  <SelectValue placeholder={addLoading ? "Adding..." : "Select bank to add"} />
                </SelectTrigger>
                <SelectContent>
                  {availableLenders.map((lender) => (
                    <SelectItem key={lender.slug} value={lender.slug}>
                      <span className="flex items-center gap-2">
                        <Plus className="h-3.5 w-3.5" />
                        {lender.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>

        <div className="mt-5 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Bank applications ({loanApplications.length})
          </p>
          {loanApplications.length > 0 ? (
            loanApplications.map((application) => {
              const visuals = application.lenderSlug
                ? lenderVisualsBySlug.get(application.lenderSlug)
                : undefined;
              return (
              <BankApplicationCard
                key={application._id}
                studentId={studentId}
                application={application}
                canWrite={canWrite}
                onUpdated={() => onBankActivity?.()}
                lenderLogo={visuals?.logo}
                lenderAccent={visuals?.accent}
              />
            );
            })
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Select a primary lender to start a loan application. You can send the same student to
              multiple banks in parallel.
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

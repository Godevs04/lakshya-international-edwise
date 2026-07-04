"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import { GlassCard } from "@/components/cards/glass-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AssigneeSelect } from "@/components/forms/assignee-select";
import {
  promoteSiteStudentLeadAction,
} from "@/lib/actions/site-lead.actions";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { formatPersonName } from "@/lib/utils/person-name";
import { ArrowUpRight } from "lucide-react";

interface PartnerOption {
  _id: string;
  companyName: string;
}

interface AssigneeOption {
  _id: string;
  name: string;
}

interface PromoteStudentLeadSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: {
    _id: string;
    studentId: string;
    firstName: string;
    lastName: string;
  };
  partners: PartnerOption[];
  assignableUsers: AssigneeOption[];
  application: {
    loanAmount: number;
    status: string;
    pipelineStage: string;
    createdAt: string;
  } | null;
  loadingApplication: boolean;
}

export function PromoteStudentLeadSheet({
  open,
  onOpenChange,
  lead,
  partners,
  assignableUsers,
  application,
  loadingApplication,
}: PromoteStudentLeadSheetProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [partnerId, setPartnerId] = useState("");
  const [assignedToId, setAssignedToId] = useState("");

  async function handlePromote() {
    setLoading(true);
    const formData = new FormData();
    if (partnerId) formData.set("partnerId", partnerId);
    if (assignedToId) formData.set("assignedToId", assignedToId);

    const result = await promoteSiteStudentLeadAction(lead._id, formData);
    if (result.success) {
      notify.success(`Promoted to student ${result.data?.officialId}`);
      onOpenChange(false);
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to promote lead");
    }
    setLoading(false);
  }

  const displayName = formatPersonName(lead.firstName, lead.lastName);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/60 px-4 py-4 pr-12">
          <SheetTitle>Promote to student</SheetTitle>
          <SheetDescription>
            {displayName} ({lead.studentId}) will receive an official student ID and appear on the
            Students page.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 py-4">
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold">Linked application</h3>
            {loadingApplication ? (
              <p className="mt-2 text-sm text-muted-foreground">Loading application...</p>
            ) : application ? (
              <div className="mt-3 space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Loan amount:</span>{" "}
                  {application.loanAmount > 0
                    ? formatCurrency(application.loanAmount)
                    : "Not captured"}
                </p>
                <p>
                  <span className="text-muted-foreground">Status:</span> {application.status}
                </p>
                <p>
                  <span className="text-muted-foreground">Pipeline:</span>{" "}
                  {application.pipelineStage}
                </p>
                <p>
                  <span className="text-muted-foreground">Created:</span>{" "}
                  {formatDate(application.createdAt)}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No linked application found.</p>
            )}
          </GlassCard>

          <div className="space-y-2">
            <Label htmlFor="promote-partnerId">Consultancy (optional)</Label>
            <Select value={partnerId} onValueChange={(value) => setPartnerId(value ?? "")}>
              <SelectTrigger id="promote-partnerId" className="w-full">
                <SelectValue placeholder="Select partner" />
              </SelectTrigger>
              <SelectContent>
                {partners.map((partner) => (
                  <SelectItem key={partner._id} value={partner._id}>
                    {partner.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="promote-assignedToId">Assignee (optional)</Label>
            <AssigneeSelect
              id="promote-assignedToId"
              users={assignableUsers}
              value={assignedToId}
              onValueChange={setAssignedToId}
              allowUnassigned
              placeholder="Select assignee"
            />
          </div>
        </div>

        <SheetFooter className="mt-0 flex-row justify-end gap-2 border-t border-border/60 px-4 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="min-w-[96px]"
          >
            Cancel
          </Button>
          <Button type="button" onClick={handlePromote} disabled={loading} className="min-w-[112px]">
            <ArrowUpRight className="mr-1.5 h-4 w-4" />
            {loading ? "Promoting..." : "Promote"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

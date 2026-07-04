"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import { useSiteLeadHighlight } from "@/hooks/use-site-lead-highlight";
import { GlassCard } from "@/components/cards/glass-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SiteStudentLeadDetail } from "@/components/dashboard/site-student-lead-detail";
import { PromoteStudentLeadSheet } from "@/components/dashboard/promote-student-lead-sheet";
import { AssigneeSelect } from "@/components/forms/assignee-select";
import {
  assignSiteStudentLeadAction,
  bulkDeleteSiteStudentLeadsAction,
  bulkPromoteSiteStudentLeadsAction,
  deleteSiteStudentLeadAction,
  exportSiteStudentLeadsCsvAction,
  getSiteStudentLeadApplication,
  getSiteStudentLeadById,
} from "@/lib/actions/site-lead.actions";
import { formatDate } from "@/lib/utils/format";
import { formatPersonName } from "@/lib/utils/person-name";
import type { SiteStudentLeadListItem } from "@/types";
import { ArrowUpRight, Download, Eye, Search, Trash2 } from "lucide-react";

interface PartnerOption {
  _id: string;
  companyName: string;
}

interface AssigneeOption {
  _id: string;
  name: string;
}

interface SiteStudentLeadsTableProps {
  data: SiteStudentLeadListItem[];
  total: number;
  page: number;
  totalPages: number;
  canWrite: boolean;
  search?: string;
  partners: PartnerOption[];
  assignableUsers: AssigneeOption[];
  highlightId?: string;
}

function buildUrl(params: { search?: string; page?: number; tab?: string }) {
  const query = new URLSearchParams();
  query.set("tab", params.tab ?? "students");
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.page && params.page > 1) query.set("page", String(params.page));
  return `/dashboard/site-leads?${query.toString()}`;
}

function formatEnquiryType(value?: string) {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function isStale(createdAt: Date) {
  return Date.now() - new Date(createdAt).getTime() > 24 * 60 * 60 * 1000;
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function SiteStudentLeadsTable({
  data,
  total,
  page,
  totalPages,
  canWrite,
  search,
  partners,
  assignableUsers,
  highlightId,
}: SiteStudentLeadsTableProps) {
  const router = useRouter();
  const [searchDraft, setSearchDraft] = useState(search ?? "");
  const [viewOpen, setViewOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<SiteStudentLeadListItem | null>(null);
  const [detailLead, setDetailLead] = useState<Awaited<ReturnType<typeof getSiteStudentLeadById>>>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);
  const [promoteApplication, setPromoteApplication] = useState<Awaited<
    ReturnType<typeof getSiteStudentLeadApplication>
  > | null>(null);
  const [loadingPromoteApplication, setLoadingPromoteApplication] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const openView = useCallback(async (lead: SiteStudentLeadListItem) => {
    setActiveLead(lead);
    setViewOpen(true);
    setLoadingDetail(true);
    const detail = await getSiteStudentLeadById(lead._id);
    setDetailLead(detail);
    setLoadingDetail(false);
  }, []);

  useSiteLeadHighlight({
    highlightId,
    data,
    onHighlight: (lead) => {
      setHighlightedRowId(lead._id);
      void openView(lead);
    },
  });

  async function openViewFromAction(lead: SiteStudentLeadListItem) {
    setHighlightedRowId(lead._id);
    await openView(lead);
  }

  function openPromote(lead: SiteStudentLeadListItem) {
    setActiveLead(lead);
    setPromoteOpen(true);
    setPromoteApplication(null);
    setLoadingPromoteApplication(true);
    void getSiteStudentLeadApplication(lead._id).then((result) => {
      setPromoteApplication(result);
      setLoadingPromoteApplication(false);
    });
  }

  function openDelete(lead: SiteStudentLeadListItem) {
    setActiveLead(lead);
    setDeleteOpen(true);
  }

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((current) =>
      checked ? Array.from(new Set([...current, id])) : current.filter((entry) => entry !== id)
    );
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? data.map((lead) => lead._id) : []);
  }

  async function runBulkPromote() {
    if (!selectedIds.length) return;
    setBulkLoading(true);
    const result = await bulkPromoteSiteStudentLeadsAction(selectedIds);
    if (result.success) {
      notify.success(`Promoted ${result.data?.promoted ?? 0} student leads`);
      setSelectedIds([]);
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to promote selected leads");
    }
    setBulkLoading(false);
  }

  async function runBulkDelete() {
    if (!selectedIds.length) return;
    setBulkLoading(true);
    const result = await bulkDeleteSiteStudentLeadsAction(selectedIds);
    if (result.success) {
      notify.success(`Deleted ${result.data?.deleted ?? 0} student leads`);
      setSelectedIds([]);
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to delete selected leads");
    }
    setBulkLoading(false);
  }

  async function exportCsv() {
    const result = await exportSiteStudentLeadsCsvAction(search);
    if (result.success && result.data) {
      downloadCsv("site-student-leads.csv", result.data);
    } else {
      notify.error(result.error ?? "Failed to export leads");
    }
  }

  async function assignLead(assignedToId: string) {
    if (!detailLead) return;
    setAssigning(true);
    const result = await assignSiteStudentLeadAction(detailLead._id, assignedToId);
    if (result.success) {
      notify.success(assignedToId ? "Lead assigned" : "Lead unassigned");
      const refreshed = await getSiteStudentLeadById(detailLead._id);
      setDetailLead(refreshed);
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to assign lead");
    }
    setAssigning(false);
  }

  async function confirmDelete() {
    if (!activeLead) return;
    setDeleting(true);
    const result = await deleteSiteStudentLeadAction(activeLead._id);
    if (result.success) {
      notify.success("Site lead deleted");
      setDeleteOpen(false);
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to delete lead");
    }
    setDeleting(false);
  }

  return (
    <div className="space-y-4">
      <GlassCard className="p-4">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            router.push(buildUrl({ search: searchDraft, tab: "students" }));
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search by name, phone, email, or ID..."
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">
            Search
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
            <Download className="mr-1.5 h-4 w-4" />
            Export CSV
          </Button>
        </form>
      </GlassCard>

      {canWrite && selectedIds.length > 0 ? (
        <GlassCard className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium">{selectedIds.length} selected</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={runBulkPromote} disabled={bulkLoading}>
              Bulk promote
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={runBulkDelete}
              disabled={bulkLoading}
            >
              Bulk delete
            </Button>
          </div>
        </GlassCard>
      ) : null}

      <GlassCard className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {canWrite ? (
                <TableHead className="w-10">
                  <Checkbox
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                  />
                </TableHead>
              ) : null}
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Loan</TableHead>
              <TableHead>Lender</TableHead>
              <TableHead>Enquiry</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length ? (
              data.map((lead) => (
                <TableRow
                  key={lead._id}
                  className={highlightedRowId === lead._id ? "bg-[#E8952E]/10" : undefined}
                >
                  {canWrite ? (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(lead._id)}
                        onCheckedChange={(checked) => toggleSelected(lead._id, checked === true)}
                      />
                    </TableCell>
                  ) : null}
                  <TableCell className="font-mono text-xs">{lead.studentId}</TableCell>
                  <TableCell className="font-medium">
                    {formatPersonName(lead.firstName, lead.lastName)}
                  </TableCell>
                  <TableCell>{lead.phone ?? "—"}</TableCell>
                  <TableCell>{lead.targetCountry ?? "—"}</TableCell>
                  <TableCell>{lead.loanAmountText ?? "—"}</TableCell>
                  <TableCell>{lead.preferredLender ?? "—"}</TableCell>
                  <TableCell>{formatEnquiryType(lead.enquiryType)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span>{formatDate(lead.createdAt)}</span>
                      {isStale(lead.createdAt) ? (
                        <span className="w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                          SLA &gt;24h
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => openViewFromAction(lead)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canWrite ? (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openPromote(lead)}
                          >
                            <ArrowUpRight className="h-4 w-4 text-[#E8952E]" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openDelete(lead)}
                          >
                            <Trash2 className="h-4 w-4 text-[#EF4444]" />
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={canWrite ? 10 : 9}
                  className="h-24 text-center text-muted-foreground"
                >
                  No website student leads awaiting review.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </GlassCard>

      <div className="flex flex-col gap-3 rounded-2xl bg-white/50 px-3 py-3 text-sm text-muted-foreground backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:bg-white/5">
        <span>{total} pending student leads</span>
        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => router.push(buildUrl({ search, page: page - 1, tab: "students" }))}
          >
            Previous
          </Button>
          <span className="flex items-center px-2">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => router.push(buildUrl({ search, page: page + 1, tab: "students" }))}
          >
            Next
          </Button>
        </div>
      </div>

      <Sheet open={viewOpen} onOpenChange={setViewOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg">
          <SheetHeader className="border-b border-border/60 px-4 py-4 pr-12">
            <SheetTitle>Student lead details</SheetTitle>
          </SheetHeader>
          <div className="px-4 py-4">
            {loadingDetail ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : detailLead ? (
              <div className="space-y-4">
                {canWrite ? (
                  <GlassCard className="p-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Assign before promote</p>
                      <AssigneeSelect
                        users={assignableUsers}
                        value={detailLead.assignedTo ?? ""}
                        onValueChange={assignLead}
                        allowUnassigned
                        placeholder="Select assignee"
                      />
                      {assigning ? (
                        <p className="text-xs text-muted-foreground">Saving assignment...</p>
                      ) : null}
                    </div>
                  </GlassCard>
                ) : null}
                <SiteStudentLeadDetail lead={detailLead} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Lead not found.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {activeLead && canWrite ? (
        <PromoteStudentLeadSheet
          open={promoteOpen}
          onOpenChange={setPromoteOpen}
          lead={activeLead}
          partners={partners}
          assignableUsers={assignableUsers}
          application={promoteApplication}
          loadingApplication={loadingPromoteApplication}
        />
      ) : null}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete site lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              {activeLead
                ? formatPersonName(activeLead.firstName, activeLead.lastName)
                : "this lead"}{" "}
              and any linked application. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

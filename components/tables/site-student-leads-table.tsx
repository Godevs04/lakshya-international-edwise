"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import { GlassCard } from "@/components/cards/glass-card";
import { Button } from "@/components/ui/button";
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
import {
  deleteSiteStudentLeadAction,
  getSiteStudentLeadById,
} from "@/lib/actions/site-lead.actions";
import { formatDate } from "@/lib/utils/format";
import { formatPersonName } from "@/lib/utils/person-name";
import type { SiteStudentLeadListItem } from "@/types";
import { ArrowUpRight, Eye, Search, Trash2 } from "lucide-react";

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

export function SiteStudentLeadsTable({
  data,
  total,
  page,
  totalPages,
  canWrite,
  search,
  partners,
  assignableUsers,
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

  async function openView(lead: SiteStudentLeadListItem) {
    setActiveLead(lead);
    setViewOpen(true);
    setLoadingDetail(true);
    const detail = await getSiteStudentLeadById(lead._id);
    setDetailLead(detail);
    setLoadingDetail(false);
  }

  function openPromote(lead: SiteStudentLeadListItem) {
    setActiveLead(lead);
    setPromoteOpen(true);
  }

  function openDelete(lead: SiteStudentLeadListItem) {
    setActiveLead(lead);
    setDeleteOpen(true);
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
        </form>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Enquiry</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length ? (
              data.map((lead) => (
                <TableRow key={lead._id}>
                  <TableCell className="font-mono text-xs">{lead.studentId}</TableCell>
                  <TableCell className="font-medium">
                    {formatPersonName(lead.firstName, lead.lastName)}
                  </TableCell>
                  <TableCell>{lead.phone ?? "—"}</TableCell>
                  <TableCell>{lead.targetCountry ?? "—"}</TableCell>
                  <TableCell>{formatEnquiryType(lead.enquiryType)}</TableCell>
                  <TableCell>{formatDate(lead.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => openView(lead)}>
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
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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
              <SiteStudentLeadDetail lead={detailLead} />
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

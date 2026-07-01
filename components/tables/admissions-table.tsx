"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import { GlassCard } from "@/components/cards/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddAdmissionSheet } from "@/components/dashboard/add-admission-sheet";
import { updateAdmissionRevenueAction } from "@/lib/actions/admission.actions";
import { TARGET_COUNTRIES, TARGET_INTAKES } from "@/lib/constants/study-abroad";
import { formatCurrency } from "@/lib/utils/format";
import type { AdmissionListItem } from "@/types";
import { Search, X, Pencil } from "lucide-react";
import { getAdmissionDetailHref } from "@/lib/constants/admission-edit-sections";
import { formatPersonName } from "@/lib/utils/person-name";

interface AssigneeOption {
  _id: string;
  name: string;
}

interface AdmissionsTableProps {
  data: AdmissionListItem[];
  total: number;
  page: number;
  totalPages: number;
  canWrite?: boolean;
  canViewRevenue?: boolean;
  search?: string;
  targetCountry?: string;
  targetIntake?: string;
  assignableUsers: AssigneeOption[];
}

function buildAdmissionsUrl(params: {
  search?: string;
  targetCountry?: string;
  targetIntake?: string;
  page?: number;
}) {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.targetCountry) query.set("targetCountry", params.targetCountry);
  if (params.targetIntake) query.set("targetIntake", params.targetIntake);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const text = query.toString();
  return text ? `/dashboard/admissions?${text}` : "/dashboard/admissions";
}

function AdmissionRevenueCell({
  studentId,
  value,
  canEdit,
}: {
  studentId: string;
  value?: number;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));
  const [saving, setSaving] = useState(false);

  async function saveRevenue() {
    setSaving(true);
    const formData = new FormData();
    formData.set("studentId", studentId);
    formData.set("admissionRevenue", draft.trim() || "0");
    const result = await updateAdmissionRevenueAction(formData);
    if (result.success) {
      notify.success("Admission revenue updated");
      setEditing(false);
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to update admission revenue");
    }
    setSaving(false);
  }

  if (!canEdit) {
    return (
      <span className="font-medium">
        {value != null && value > 0 ? formatCurrency(value) : "—"}
      </span>
    );
  }

  if (editing) {
    return (
      <div className="flex min-w-[140px] items-center gap-2">
        <Input
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="h-8"
        />
        <Button type="button" size="sm" disabled={saving} onClick={saveRevenue}>
          {saving ? "..." : "Save"}
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(String(value ?? ""));
        setEditing(true);
      }}
      className="font-medium text-[#E8952E] hover:underline"
    >
      {value != null && value > 0 ? formatCurrency(value) : "Set revenue"}
    </button>
  );
}

export function AdmissionsTable({
  data,
  total,
  page,
  totalPages,
  canWrite = false,
  canViewRevenue = false,
  search = "",
  targetCountry = "",
  targetIntake = "",
  assignableUsers,
}: AdmissionsTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState(search);
  const [countryFilter, setCountryFilter] = useState(targetCountry);
  const [intakeFilter, setIntakeFilter] = useState(targetIntake);

  const hasActiveFilters = Boolean(search || targetCountry || targetIntake);

  function applyFilters(nextPage = 1) {
    router.push(
      buildAdmissionsUrl({
        search: query,
        targetCountry: countryFilter,
        targetIntake: intakeFilter,
        page: nextPage,
      })
    );
  }

  function clearFilters() {
    setQuery("");
    setCountryFilter("");
    setIntakeFilter("");
    router.push("/dashboard/admissions");
  }

  function goToPage(nextPage: number) {
    router.push(
      buildAdmissionsUrl({
        search,
        targetCountry,
        targetIntake,
        page: nextPage,
      })
    );
  }

  return (
    <div className="space-y-4">
      <GlassCard className="space-y-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <form
            className="flex w-full max-w-md gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              applyFilters(1);
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search student, number, university..."
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
          {canWrite ? (
            <AddAdmissionSheet assignableUsers={assignableUsers} canViewRevenue={canViewRevenue} />
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="admission-filter-country">Country</Label>
            <Select
              value={countryFilter || "all"}
              onValueChange={(value) => setCountryFilter(value === "all" ? "" : value ?? "")}
            >
              <SelectTrigger id="admission-filter-country" className="w-full">
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {TARGET_COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admission-filter-intake">Intake</Label>
            <Select
              value={intakeFilter || "all"}
              onValueChange={(value) => setIntakeFilter(value === "all" ? "" : value ?? "")}
            >
              <SelectTrigger id="admission-filter-intake" className="w-full">
                <SelectValue placeholder="All intakes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All intakes</SelectItem>
                {TARGET_INTAKES.map((intake) => (
                  <SelectItem key={intake} value={intake}>
                    {intake}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => applyFilters(1)}>
              Apply filters
            </Button>
            {hasActiveFilters ? (
              <Button type="button" variant="outline" onClick={clearFilters}>
                <X className="mr-1.5 h-4 w-4" />
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        {hasActiveFilters ? (
          <div className="flex flex-wrap gap-2">
            {search ? <Badge variant="outline">Search: {search}</Badge> : null}
            {targetCountry ? <Badge variant="outline">Country: {targetCountry}</Badge> : null}
            {targetIntake ? <Badge variant="outline">Intake: {targetIntake}</Badge> : null}
          </div>
        ) : null}
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student name</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Intake</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>University</TableHead>
              {canViewRevenue ? <TableHead>Revenue</TableHead> : null}
              {canWrite ? <TableHead className="text-right">Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length ? (
              data.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>
                    <div className="space-y-1">
                      <Link
                        href={getAdmissionDetailHref(row._id)}
                        className="font-semibold text-primary hover:underline"
                      >
                        {formatPersonName(row.firstName, row.lastName)}
                      </Link>
                      <p className="text-xs text-muted-foreground">{row.studentId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {row.leadSource === "website" ? (
                      <div className="space-y-0.5">
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          Website
                        </Badge>
                        {row.formPage ? (
                          <p className="text-xs text-muted-foreground">{row.formPage}</p>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Manual</span>
                    )}
                  </TableCell>
                  <TableCell>{row.phone?.trim() ? row.phone : "—"}</TableCell>
                  <TableCell>{row.targetIntake?.trim() ? row.targetIntake : "—"}</TableCell>
                  <TableCell>{row.targetCountry?.trim() ? row.targetCountry : "—"}</TableCell>
                  <TableCell className="max-w-[220px] truncate">
                    {row.targetUniversity?.trim() ? row.targetUniversity : "—"}
                  </TableCell>
                  {canViewRevenue ? (
                    <TableCell>
                      <AdmissionRevenueCell
                        studentId={row._id}
                        value={row.admissionRevenue}
                        canEdit={canWrite}
                      />
                    </TableCell>
                  ) : null}
                  {canWrite ? (
                    <TableCell className="text-right">
                      <Link href={getAdmissionDetailHref(row._id)}>
                        <Button variant="ghost" size="sm" className="h-8">
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          View / Edit
                        </Button>
                      </Link>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={canWrite ? (canViewRevenue ? 7 : 6) : canViewRevenue ? 6 : 5} className="h-24 text-center text-muted-foreground">
                  No admission records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </GlassCard>

      <div className="flex flex-col gap-3 rounded-2xl bg-white/50 px-3 py-3 text-sm text-muted-foreground backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:bg-white/5">
        <span>
          {total} admission record{total === 1 ? "" : "s"}
        </span>
        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
            Previous
          </Button>
          <span className="flex items-center px-2">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

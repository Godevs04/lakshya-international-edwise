"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { STUDENT_STATUSES } from "@/lib/constants/statuses";
import { useLenderOptions } from "@/components/lenders/use-lender-options";
import { TARGET_COUNTRIES, TARGET_INTAKES } from "@/lib/constants/study-abroad";
import type { StudentListFilters } from "@/lib/utils/student-list-filters";
import { countActiveAdvancedFilters } from "@/lib/utils/student-list-filters";
import { SlidersHorizontal } from "lucide-react";

const ANY_OPTION = "__any__";

interface PartnerOption {
  _id: string;
  companyName: string;
}

interface AssigneeOption {
  _id: string;
  name: string;
}

interface AdvancedSearchDraft {
  partnerId: string;
  assignedToId: string;
  targetCountry: string;
  targetIntake: string;
  status: string;
  state: string;
  college: string;
  course: string;
  lenderId: string;
  dateFrom: string;
  dateTo: string;
  loanMin: string;
  loanMax: string;
}

interface StudentAdvancedSearchProps {
  filters: StudentListFilters;
  partners: PartnerOption[];
  assignableUsers: AssigneeOption[];
  onApply: (filters: Partial<StudentListFilters>) => void;
  onClear: () => void;
}

function toSelectValue(value?: string) {
  return value?.trim() ? value : ANY_OPTION;
}

function fromSelectValue(value: string) {
  return value === ANY_OPTION ? "" : value;
}

function createDraftFromFilters(filters: StudentListFilters): AdvancedSearchDraft {
  return {
    partnerId: filters.partnerId ?? "",
    assignedToId: filters.assignedToId ?? "",
    targetCountry: filters.targetCountry ?? "",
    targetIntake: filters.targetIntake ?? "",
    status: filters.status ?? "",
    state: filters.state ?? "",
    college: filters.college ?? "",
    course: filters.course ?? "",
    lenderId: filters.lenderId ?? "",
    dateFrom: filters.dateFrom ?? "",
    dateTo: filters.dateTo ?? "",
    loanMin: filters.loanMin ?? "",
    loanMax: filters.loanMax ?? "",
  };
}

export function StudentAdvancedSearch({
  filters,
  partners,
  assignableUsers,
  onApply,
  onClear,
}: StudentAdvancedSearchProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AdvancedSearchDraft>(() => createDraftFromFilters(filters));
  const { options: lenderOptions } = useLenderOptions();

  const activeCount = countActiveAdvancedFilters(filters);

  const assigneeItems = [
    { value: ANY_OPTION, label: "Any counsellor" },
    ...assignableUsers.map((user) => ({ value: user._id, label: user.name })),
  ];

  function updateDraft<K extends keyof AdvancedSearchDraft>(key: K, value: AdvancedSearchDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(createDraftFromFilters(filters));
    }
    setOpen(nextOpen);
  }

  function handleApply() {
    onApply({
      partnerId: draft.partnerId || undefined,
      assignedToId: draft.assignedToId || undefined,
      targetCountry: draft.targetCountry || undefined,
      targetIntake: draft.targetIntake || undefined,
      status: draft.status || undefined,
      state: draft.state || undefined,
      college: draft.college || undefined,
      course: draft.course || undefined,
      lenderId: draft.lenderId || undefined,
      dateFrom: draft.dateFrom || undefined,
      dateTo: draft.dateTo || undefined,
      loanMin: draft.loanMin || undefined,
      loanMax: draft.loanMax || undefined,
      workflow: draft.status ? undefined : filters.workflow,
      page: undefined,
    });
    setOpen(false);
  }

  function handleClear() {
    onClear();
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button variant="outline" className="relative">
            <SlidersHorizontal className="mr-1.5 h-4 w-4" />
            Advanced
            {activeCount > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6D5EF7] px-1.5 text-xs font-semibold text-white">
                {activeCount}
              </span>
            )}
          </Button>
        }
      />
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Advanced Search</SheetTitle>
          <SheetDescription>
            Narrow students by partner, counsellor, study abroad details, dates, and loan amount.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 px-4 py-2">
          <div className="space-y-2">
            <Label>Partner</Label>
            <Select
              value={toSelectValue(draft.partnerId)}
              onValueChange={(value) => updateDraft("partnerId", fromSelectValue(value ?? ANY_OPTION))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any partner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_OPTION}>Any partner</SelectItem>
                {partners.map((partner) => (
                  <SelectItem key={partner._id} value={partner._id}>
                    {partner.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select
              value={toSelectValue(draft.assignedToId)}
              onValueChange={(value) => updateDraft("assignedToId", fromSelectValue(value ?? ANY_OPTION))}
              items={assigneeItems}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any counsellor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_OPTION}>Any counsellor</SelectItem>
                {assignableUsers.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={toSelectValue(draft.status)}
              onValueChange={(value) => updateDraft("status", fromSelectValue(value ?? ANY_OPTION))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_OPTION}>Any status</SelectItem>
                {STUDENT_STATUSES.map((entry) => (
                  <SelectItem key={entry} value={entry}>
                    {entry.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Target country</Label>
              <Select
                value={toSelectValue(draft.targetCountry)}
                onValueChange={(value) => updateDraft("targetCountry", fromSelectValue(value ?? ANY_OPTION))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY_OPTION}>Any country</SelectItem>
                  {TARGET_COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target intake</Label>
              <Select
                value={toSelectValue(draft.targetIntake)}
                onValueChange={(value) => updateDraft("targetIntake", fromSelectValue(value ?? ANY_OPTION))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any intake" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY_OPTION}>Any intake</SelectItem>
                  {TARGET_INTAKES.map((intake) => (
                    <SelectItem key={intake} value={intake}>
                      {intake}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Joined from</Label>
              <Input
                id="dateFrom"
                type="date"
                value={draft.dateFrom}
                onChange={(e) => updateDraft("dateFrom", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Joined to</Label>
              <Input
                id="dateTo"
                type="date"
                value={draft.dateTo}
                onChange={(e) => updateDraft("dateTo", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="loanMin">Loan min (₹)</Label>
              <Input
                id="loanMin"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={draft.loanMin}
                onChange={(e) => updateDraft("loanMin", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanMax">Loan max (₹)</Label>
              <Input
                id="loanMax"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={draft.loanMax}
                onChange={(e) => updateDraft("loanMax", e.target.value)}
                placeholder="1000000"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={draft.state}
                onChange={(e) => updateDraft("state", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lenderId">Lender</Label>
              <Select
                value={toSelectValue(draft.lenderId)}
                onValueChange={(value) => updateDraft("lenderId", fromSelectValue(value ?? ANY_OPTION))}
                items={[
                  { value: ANY_OPTION, label: "Any lender" },
                  ...lenderOptions.map((lender) => ({ value: lender.slug, label: lender.name })),
                ]}
              >
                <SelectTrigger id="lenderId" className="w-full">
                  <SelectValue placeholder="Any lender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY_OPTION}>Any lender</SelectItem>
                  {lenderOptions.map((lender) => (
                    <SelectItem key={lender.slug} value={lender.slug}>
                      {lender.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              <Input
                id="college"
                value={draft.college}
                onChange={(e) => updateDraft("college", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Input
                id="course"
                value={draft.course}
                onChange={(e) => updateDraft("course", e.target.value)}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={handleClear}>
            Clear all
          </Button>
          <Button type="button" onClick={handleApply}>
            Apply filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

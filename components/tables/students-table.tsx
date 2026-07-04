"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { StudentListItem } from "@/types";
import type { StudentStatus } from "@/lib/constants/statuses";
import { StudentContactActions } from "@/components/dashboard/student-contact-actions";
import { StudentImportDialog } from "@/components/dashboard/student-import-dialog";
import { StudentStageTabs } from "@/components/dashboard/student-stage-tabs";
import { StudentAdvancedSearch } from "@/components/dashboard/student-advanced-search";
import { ProfileCompleteBadge } from "@/components/dashboard/profile-complete-badge";
import {
  buildStudentListQuery,
  type StudentListFilters,
} from "@/lib/utils/student-list-filters";
import { QuickAddStudentSheet } from "@/components/dashboard/quick-add-student-sheet";
import { StudentBulkActionsBar } from "@/components/dashboard/student-bulk-actions-bar";
import { Download } from "lucide-react";

interface PartnerOption {
  _id: string;
  companyName: string;
}

interface AssigneeOption {
  _id: string;
  name: string;
}

interface StudentsTableProps {
  data: StudentListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  canDelete?: boolean;
  canExport?: boolean;
  canWrite?: boolean;
  filters: StudentListFilters;
  partners: PartnerOption[];
  assignableUsers: AssigneeOption[];
}

export function StudentsTable({
  data,
  total,
  page,
  totalPages,
  canDelete = false,
  canExport = false,
  canWrite = false,
  filters,
  partners,
  assignableUsers,
}: StudentsTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState(filters.search ?? "");

  const canSelect = canWrite || canDelete;

  function toggleSelected(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    );
  }

  const isMine = filters.mine === "1";

  function navigate(next: Partial<StudentListFilters>) {
    const query = buildStudentListQuery(filters, next);
    router.push(query ? `/dashboard/students?${query}` : "/dashboard/students");
  }

  const columns: ColumnDef<StudentListItem>[] = [
    {
      id: "select",
      header: ({ table }) => (
        canSelect ? (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Select all students on this page"
          />
        ) : null
      ),
      cell: ({ row }) => (
        canSelect ? (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={`Select ${row.original.firstName} ${row.original.lastName}`}
          />
        ) : null
      ),
    },
    {
      accessorKey: "studentId",
      header: "Student ID",
      cell: ({ row }) => (
        <Link href={`/dashboard/students/${row.original._id}`} className="font-medium text-primary hover:underline">
          {row.original.studentId}
        </Link>
      ),
    },
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5">
          <span>{row.original.firstName} {row.original.lastName}</span>
          <ProfileCompleteBadge verified={Boolean(row.original.profileVerified)} />
        </span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <StudentContactActions
          phone={row.original.phone}
          whatsapp={row.original.whatsapp}
          studentName={`${row.original.firstName} ${row.original.lastName}`}
          channels="whatsapp"
          showPhoneLabel
        />
      ),
    },
    { accessorKey: "partnerName", header: "Partner" },
    { accessorKey: "assigneeName", header: "Assignee", cell: ({ row }) => row.original.assigneeName ?? "—" },
    {
      id: "studyAbroad",
      header: "Target",
      cell: ({ row }) => {
        const parts = [row.original.targetCountry, row.original.targetDegree].filter(Boolean);
        return parts.length ? parts.join(" · ") : "—";
      },
    },
    {
      accessorKey: "loanRequested",
      header: "Loan",
      cell: ({ row }) => formatCurrency(row.original.loanRequested ?? 0),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status as StudentStatus} />,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns unstable function refs by design
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting, rowSelection: Object.fromEntries(selected.map((id) => [id, true])) },
    getRowId: (row) => row._id,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === "function"
        ? updater(Object.fromEntries(selected.map((id) => [id, true])))
        : updater;
      setSelected(Object.keys(newSelection).filter((k) => newSelection[k]));
    },
  });

  function handleBulkComplete() {
    setSelected([]);
    router.refresh();
  }

  function handleExportCSV() {
    const headers = ["Student ID", "Name", "Phone", "Partner", "Assignee", "Target", "Loan", "Status", "Created"];
    const rows = data.map((s) => [
      s.studentId,
      `${s.firstName} ${s.lastName}`,
      s.phone ?? "",
      s.partnerName ?? "",
      s.assigneeName ?? "",
      [s.targetCountry, s.targetDegree].filter(Boolean).join(" · "),
      s.loanRequested ?? 0,
      s.status,
      formatDate(s.createdAt),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
  }

  function applySearch() {
    navigate({ search: search.trim() || undefined, page: undefined });
  }

  function toggleMine() {
    navigate({ mine: isMine ? undefined : "1", page: undefined });
  }

  function handleWorkflowChange(workflowId: string) {
    navigate({
      workflow: workflowId === "all" ? undefined : workflowId,
      status: undefined,
      page: undefined,
    });
  }

  function handleAdvancedApply(next: Partial<StudentListFilters>) {
    navigate({ ...next, page: undefined });
  }

  function handleAdvancedClear() {
    navigate({
      partnerId: undefined,
      assignedToId: undefined,
      targetCountry: undefined,
      targetIntake: undefined,
      status: undefined,
      lenderId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      loanMin: undefined,
      loanMax: undefined,
      page: undefined,
    });
  }

  function goToPage(nextPage: number) {
    navigate({ page: nextPage > 1 ? String(nextPage) : undefined });
  }

  const paginationBar = (
    <div className="flex flex-col gap-3 rounded-2xl bg-white/50 px-3 py-3 text-sm text-muted-foreground backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:bg-white/5">
      <span>{total} total students</span>
      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
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
          onClick={() => goToPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <GlassCard className="space-y-4 p-4">
        <StudentStageTabs
          activeWorkflow={filters.workflow ?? "all"}
          onWorkflowChange={handleWorkflowChange}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap gap-2">
            <Input
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              className="w-full min-w-0 sm:max-w-xs"
            />
            <Button variant="outline" onClick={applySearch}>Search</Button>
            <StudentAdvancedSearch
              filters={filters}
              partners={partners}
              assignableUsers={assignableUsers}
              onApply={handleAdvancedApply}
              onClear={handleAdvancedClear}
            />
            <Button variant={isMine ? "default" : "outline"} onClick={toggleMine}>
              My Students
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {canWrite && (
              <QuickAddStudentSheet assignableUsers={assignableUsers} />
            )}
            {canWrite && <StudentImportDialog canWrite={canWrite} />}
            {canExport && (
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="mr-1 h-4 w-4" /> Export
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {canSelect && selected.length > 0 && (
            <StudentBulkActionsBar
              key="bulk-actions"
              selectedIds={selected}
              assignableUsers={assignableUsers}
              partners={partners}
              canDelete={canDelete}
              onClear={() => setSelected([])}
              onComplete={handleBulkComplete}
            />
          )}
        </AnimatePresence>
      </GlassCard>

      {paginationBar}

      <div className="space-y-3 md:hidden">
        {data.length ? (
          data.map((student) => {
            const isSelected = selected.includes(student._id);
            return (
              <GlassCard key={student._id} className="p-4">
                <div className="flex items-start gap-3">
                  {canSelect && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelected(student._id)}
                      aria-label={`Select ${student.firstName} ${student.lastName}`}
                      className="mt-1"
                    />
                  )}
                  <div
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(`/dashboard/students/${student._id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/dashboard/students/${student._id}`);
                      }
                    }}
                    className="block min-w-0 flex-1 cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#E8952E]/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          <span className="inline-flex items-center gap-1">
                            {student.firstName} {student.lastName}
                            <ProfileCompleteBadge verified={Boolean(student.profileVerified)} />
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">{student.studentId}</p>
                      </div>
                      <StatusBadge status={student.status as StudentStatus} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Partner</p>
                    <p className="truncate">{student.partnerName ?? "—"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Loan</p>
                    <p>{formatCurrency(student.loanRequested ?? 0)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Assignee</p>
                    <p className="truncate">{student.assigneeName ?? "—"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Target</p>
                    <p className="truncate">
                      {[student.targetCountry, student.targetDegree].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Phone</p>
                    <StudentContactActions
                      phone={student.phone}
                      whatsapp={student.whatsapp}
                      studentName={`${student.firstName} ${student.lastName}`}
                      channels="whatsapp"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Created</p>
                    <p>{formatDate(student.createdAt)}</p>
                  </div>
                </div>
              </GlassCard>
            );
          })
        ) : (
          <GlassCard className="p-8 text-center text-muted-foreground">
            No students found.
          </GlassCard>
        )}
      </div>

      <GlassCard className="hidden overflow-hidden md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </GlassCard>

      {paginationBar}
    </div>
  );
}

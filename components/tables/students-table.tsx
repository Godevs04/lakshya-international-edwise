"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { STUDENT_STATUSES } from "@/lib/constants/statuses";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { bulkUpdateStudentsAction } from "@/lib/actions/student.actions";
import type { StudentListItem } from "@/types";
import type { StudentStatus } from "@/lib/constants/statuses";
import { Plus, Trash2, Download } from "lucide-react";

interface StudentsTableProps {
  data: StudentListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function StudentsTable({
  data,
  total,
  page,
  pageSize,
  totalPages,
}: StudentsTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const columns: ColumnDef<StudentListItem>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
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
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "partnerName", header: "Partner" },
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

  async function handleBulkDelete() {
    if (!selected.length) return;
    const result = await bulkUpdateStudentsAction(selected, "delete");
    if (result.success) {
      toast.success("Students deleted");
      setSelected([]);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  function handleExportCSV() {
    const headers = ["Student ID", "Name", "Phone", "Partner", "Loan", "Status", "Created"];
    const rows = data.map((s) => [
      s.studentId,
      `${s.firstName} ${s.lastName}`,
      s.phone ?? "",
      s.partnerName ?? "",
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

  function applyFilters() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    router.push(`/dashboard/students?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <GlassCard className="p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="max-w-xs"
          />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "")}>
            <SelectTrigger className="w-[160px] rounded-xl border-[#6D5EF7]/15 bg-white/60 backdrop-blur-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="">All Status</SelectItem>
              {STUDENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={applyFilters}>Filter</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {selected.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="mr-1 h-4 w-4" /> Delete ({selected.length})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-1 h-4 w-4" /> Export
          </Button>
          <Link href="/dashboard/students/new">
            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Student</Button>
          </Link>
        </div>
      </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
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

      <div className="flex items-center justify-between rounded-2xl bg-white/50 px-4 py-3 text-sm text-muted-foreground backdrop-blur-xl dark:bg-white/5">
        <span>{total} total students</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => router.push(`/dashboard/students?page=${page - 1}`)}
          >
            Previous
          </Button>
          <span className="flex items-center px-2">Page {page} of {totalPages || 1}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => router.push(`/dashboard/students?page=${page + 1}`)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/cards/glass-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getReportAction, exportReportCSVAction } from "@/lib/actions/report.actions";
import type { DateRangePreset } from "@/lib/utils/format";
import type { ReportType } from "@/lib/services/report.service";
import { Download, Printer } from "lucide-react";

const presets: DateRangePreset[] = ["daily", "weekly", "monthly", "yearly"];
const reportTypes: { value: ReportType; label: string }[] = [
  { value: "partner", label: "Partner Wise" },
  { value: "student", label: "Student Wise" },
  { value: "loan", label: "Loan Wise" },
];

export function ReportsView() {
  const [preset, setPreset] = useState<DateRangePreset>("monthly");
  const [reportType, setReportType] = useState<ReportType>("student");
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadReport(p: DateRangePreset, type: ReportType) {
    setLoading(true);
    try {
      const result = await getReportAction(p, type);
      setData(result as Record<string, unknown>[]);
    } catch {
      toast.error("Failed to load report");
    }
    setLoading(false);
  }

  async function handleExport() {
    try {
      const csv = await exportReportCSVAction(preset, reportType);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${reportType}-${preset}.csv`;
      a.click();
      toast.success("Report exported");
    } catch {
      toast.error("Export failed");
    }
  }

  function handlePrint() {
    window.print();
  }

  const columns = data.length > 0
    ? Object.keys(data[0] ?? {}).filter((k) => k !== "__v" && k !== "_id")
    : [];

  return (
    <div className="space-y-6">
      <Tabs value={preset} onValueChange={(v) => { setPreset(v as DateRangePreset); loadReport(v as DateRangePreset, reportType); }}>
        <TabsList>
          {presets.map((p) => (
            <TabsTrigger key={p} value={p} className="capitalize">{p}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Tabs value={reportType} onValueChange={(v) => { setReportType(v as ReportType); loadReport(preset, v as ReportType); }}>
        <TabsList>
          {reportTypes.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex gap-2">
        <Button onClick={() => loadReport(preset, reportType)} disabled={loading}>
          {loading ? "Loading..." : "Generate Report"}
        </Button>
        <Button variant="outline" onClick={handleExport} disabled={!data.length}>
          <Download className="mr-1 h-4 w-4" /> Export CSV
        </Button>
        <Button variant="outline" onClick={handlePrint} disabled={!data.length}>
          <Printer className="mr-1 h-4 w-4" /> Print
        </Button>
      </div>

      <GlassCard className="p-5">
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col} className="capitalize">{col.replace(/([A-Z])/g, " $1")}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col}>
                        {typeof row[col] === "object" ? JSON.stringify(row[col]) : String(row[col] ?? "—")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="py-8 text-center text-muted-foreground">
            Select a period and report type, then click Generate Report.
          </p>
        )}
      </GlassCard>
    </div>
  );
}

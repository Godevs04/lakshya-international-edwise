"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/cards/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APPLICATION_STATUSES } from "@/lib/constants/statuses";
import { updateApplicationStatusAction } from "@/lib/actions/application.actions";
import { formatCurrency } from "@/lib/utils/format";
import type { ApplicationListItem, PaginatedResult } from "@/types";
import type { ApplicationStatus } from "@/lib/constants/statuses";

function KanbanCard({ app, canWrite }: { app: ApplicationListItem; canWrite: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: app._id,
    disabled: !canWrite,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(canWrite ? { ...attributes, ...listeners } : {})}
    >
      <GlassCard
        hover={canWrite}
        className={`mb-2 p-4 ${canWrite ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
      >
        <p className="text-sm font-semibold">{app.studentName}</p>
        <p className="text-xs text-muted-foreground">{app.studentId}</p>
        <p className="mt-2 text-base font-bold text-[#E8952E]">{formatCurrency(app.loanAmount)}</p>
        {app.partnerName && <p className="mt-1 text-xs text-muted-foreground">{app.partnerName}</p>}
      </GlassCard>
    </div>
  );
}

interface ApplicationKanbanProps {
  applications: ApplicationListItem[];
  tableResult?: PaginatedResult<ApplicationListItem>;
  view?: "kanban" | "table";
  canWrite?: boolean;
}

function resolveTargetStatus(
  overId: string,
  apps: ApplicationListItem[],
  columnStatuses: readonly ApplicationStatus[]
): ApplicationStatus | null {
  if (columnStatuses.includes(overId as ApplicationStatus)) {
    return overId as ApplicationStatus;
  }

  const overApp = apps.find((a) => a._id === overId);
  return overApp?.status ?? null;
}

const kanbanCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) return pointerHits;
  return closestCorners(args);
};

const KANBAN_COLUMNS = APPLICATION_STATUSES.filter((s) => s !== "closed");

export function ApplicationKanban({
  applications: initialApps,
  tableResult,
  view: initialView = "kanban",
  canWrite = false,
}: ApplicationKanbanProps) {
  const router = useRouter();
  const [apps, setApps] = useState(initialApps);
  const [activeId, setActiveId] = useState<string | null>(null);
  const view = initialView;
  const tableApps = tableResult?.data ?? apps;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  function handleViewChange(nextView: string) {
    const params = new URLSearchParams();
    params.set("view", nextView);
    router.push(`/dashboard/applications?${params.toString()}`);
  }

  function handleDragStart(event: DragStartEvent) {
    if (!canWrite) return;
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    if (!canWrite) return;
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const appId = active.id as string;
    const newStatus = resolveTargetStatus(over.id as string, apps, KANBAN_COLUMNS);
    if (!newStatus) return;

    const app = apps.find((a) => a._id === appId);
    if (!app || app.status === newStatus) return;

    setApps((prev) =>
      prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
    );

    const result = await updateApplicationStatusAction(appId, newStatus);
    if (result.success) {
      notify.success("Status updated");
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to update status");
      setApps(initialApps);
    }
  }

  const activeApp = activeId ? apps.find((a) => a._id === activeId) : null;

  return (
    <div className="space-y-4">
      {!canWrite && view === "kanban" && (
        <p className="text-sm text-muted-foreground">View-only mode — drag & drop requires edit permission.</p>
      )}
      <Tabs value={view} onValueChange={handleViewChange}>
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-4">
          <DndContext
            sensors={sensors}
            collisionDetection={kanbanCollisionDetection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {KANBAN_COLUMNS.map((status) => (
                <div key={status} className="min-w-[240px] flex-shrink-0 sm:min-w-[280px]">
                  <div className="mb-3 flex items-center gap-2">
                    <StatusBadge status={status} />
                    <span className="text-xs text-muted-foreground">
                      ({apps.filter((a) => a.status === status).length})
                    </span>
                  </div>
                  <SortableContext
                    items={apps.filter((a) => a.status === status).map((a) => a._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <KanbanColumnInner
                      status={status}
                      apps={apps.filter((a) => a.status === status)}
                      canWrite={canWrite}
                    />
                  </SortableContext>
                </div>
              ))}
            </div>
            <DragOverlay>
              {activeApp ? (
                <GlassCard className="p-3 shadow-lg">
                  <p className="text-sm font-medium">{activeApp.studentName}</p>
                </GlassCard>
              ) : null}
            </DragOverlay>
          </DndContext>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <GlassCard className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableApps.length ? tableApps.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.studentName}</p>
                        <p className="text-xs text-muted-foreground">{app.studentId}</p>
                      </div>
                    </TableCell>
                    <TableCell>{app.partnerName ?? "—"}</TableCell>
                    <TableCell>{formatCurrency(app.loanAmount)}</TableCell>
                    <TableCell><StatusBadge status={app.status} /></TableCell>
                    <TableCell className="capitalize">{app.priority ?? "medium"}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No applications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </GlassCard>
          {tableResult && tableResult.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>{tableResult.total} total applications</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={tableResult.page <= 1}
                  onClick={() => router.push(`/dashboard/applications?view=table&page=${tableResult.page - 1}`)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-2">
                  Page {tableResult.page} of {tableResult.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={tableResult.page >= tableResult.totalPages}
                  onClick={() => router.push(`/dashboard/applications?view=table&page=${tableResult.page + 1}`)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KanbanColumnInner({
  status,
  apps,
  canWrite,
}: {
  status: ApplicationStatus;
  apps: ApplicationListItem[];
  canWrite: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] max-h-[min(70vh,720px)] overflow-y-auto rounded-2xl border border-[#E8952E]/10 p-2 transition-all ${isOver ? "bg-[#E8952E]/10 ring-2 ring-[#E8952E]/20" : "bg-white/40 backdrop-blur-sm dark:bg-white/5"}`}
    >
      {apps.map((app) => (
        <KanbanCard key={app._id} app={app} canWrite={canWrite} />
      ))}
    </div>
  );
}

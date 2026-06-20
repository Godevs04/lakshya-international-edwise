"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
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
import { GlassCard } from "@/components/cards/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
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
import type { ApplicationListItem } from "@/types";
import type { ApplicationStatus } from "@/lib/constants/statuses";

function KanbanColumn({ status, apps }: { status: ApplicationStatus; apps: ApplicationListItem[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="min-w-[280px] flex-shrink-0">
      <div className="mb-3 flex items-center gap-2">
        <StatusBadge status={status} />
        <span className="text-xs text-muted-foreground">({apps.length})</span>
      </div>
      <SortableContext items={apps.map((a) => a._id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`min-h-[200px] rounded-2xl border border-[#6D5EF7]/10 p-2 transition-all ${isOver ? "bg-[#6D5EF7]/10 ring-2 ring-[#6D5EF7]/20" : "bg-white/40 backdrop-blur-sm dark:bg-white/5"}`}
        >
          {apps.map((app) => (
            <KanbanCard key={app._id} app={app} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function KanbanCard({ app }: { app: ApplicationListItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: app._id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <GlassCard hover className="mb-2 cursor-grab p-4 active:cursor-grabbing">
        <p className="text-sm font-semibold">{app.studentName}</p>
        <p className="text-xs text-muted-foreground">{app.studentId}</p>
        <p className="mt-2 text-base font-bold text-[#6D5EF7]">{formatCurrency(app.loanAmount)}</p>
        {app.partnerName && <p className="mt-1 text-xs text-muted-foreground">{app.partnerName}</p>}
      </GlassCard>
    </div>
  );
}

interface ApplicationKanbanProps {
  applications: ApplicationListItem[];
}

export function ApplicationKanban({ applications: initialApps }: ApplicationKanbanProps) {
  const router = useRouter();
  const [apps, setApps] = useState(initialApps);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<"kanban" | "table">("kanban");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const appId = active.id as string;
    const newStatus = over.id as ApplicationStatus;
    if (!APPLICATION_STATUSES.includes(newStatus)) return;

    const app = apps.find((a) => a._id === appId);
    if (!app || app.status === newStatus) return;

    setApps((prev) =>
      prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
    );

    const result = await updateApplicationStatusAction(appId, newStatus);
    if (result.success) {
      toast.success("Status updated");
      router.refresh();
    } else {
      toast.error(result.error);
      setApps(initialApps);
    }
  }

  const activeApp = activeId ? apps.find((a) => a._id === activeId) : null;

  const columns = APPLICATION_STATUSES.filter((s) => s !== "closed");

  return (
    <div className="space-y-4">
      <Tabs value={view} onValueChange={(v) => setView(v as "kanban" | "table")}>
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {columns.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  apps={apps.filter((a) => a.status === status)}
                />
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
                {apps.map((app) => (
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
                ))}
              </TableBody>
            </Table>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

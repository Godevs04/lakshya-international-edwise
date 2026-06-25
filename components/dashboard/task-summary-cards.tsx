import Link from "next/link";
import { GlassCard } from "@/components/cards/glass-card";
import { AlertCircle, CalendarClock, UserRound } from "lucide-react";

interface TaskSummaryCardsProps {
  myOpen: number;
  overdue: number;
  dueToday: number;
  activeView?: string;
}

function SummaryCard({
  href,
  label,
  value,
  icon: Icon,
  active,
  tone,
}: {
  href: string;
  label: string;
  value: number;
  icon: typeof UserRound;
  active?: boolean;
  tone?: "default" | "warning";
}) {
  return (
    <Link href={href}>
      <GlassCard
        hover
        className={`p-4 transition-colors ${
          active ? "ring-2 ring-[#E8952E]/40" : ""
        } ${tone === "warning" && value > 0 ? "border-[#F59E0B]/30 bg-[#F59E0B]/5" : ""}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              tone === "warning" && value > 0
                ? "bg-[#F59E0B]/15 text-[#F59E0B]"
                : "bg-[#E8952E]/10 text-[#E8952E]"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}

export function TaskSummaryCards({
  myOpen,
  overdue,
  dueToday,
  activeView,
}: TaskSummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <SummaryCard
        href="/dashboard/tasks?mine=1"
        label="My open tasks"
        value={myOpen}
        icon={UserRound}
        active={activeView === "mine"}
      />
      <SummaryCard
        href="/dashboard/tasks?overdue=1"
        label="Overdue"
        value={overdue}
        icon={AlertCircle}
        active={activeView === "overdue"}
        tone="warning"
      />
      <SummaryCard
        href="/dashboard/tasks?dueToday=1"
        label="Due today"
        value={dueToday}
        icon={CalendarClock}
        active={activeView === "dueToday"}
      />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/cards/glass-card";
import type { SiteLeadsTab } from "@/lib/constants/site-leads";

interface SiteLeadsTabsProps {
  activeTab: SiteLeadsTab;
  studentCount: number;
  partnerCount: number;
  canViewStudents: boolean;
  canViewPartners: boolean;
}

function buildTabHref(tab: SiteLeadsTab, search?: string) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (search?.trim()) params.set("search", search.trim());
  return `/dashboard/site-leads?${params.toString()}`;
}

export function SiteLeadsTabs({
  activeTab,
  studentCount,
  partnerCount,
  canViewStudents,
  canViewPartners,
}: SiteLeadsTabsProps) {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? undefined;

  if (!canViewStudents || !canViewPartners) return null;

  const tabs: { id: SiteLeadsTab; label: string; count: number }[] = [
    { id: "students", label: "Student leads", count: studentCount },
    { id: "partners", label: "Partner leads", count: partnerCount },
  ];

  return (
    <GlassCard className="p-4">
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={buildTabHref(tab.id, search)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-[#0B8FD8] bg-[#0B8FD8] text-white shadow-sm"
                  : "border-[#0B8FD8]/15 bg-white/60 text-muted-foreground hover:border-[#0B8FD8]/30 hover:bg-[#0B8FD8]/8 hover:text-foreground dark:bg-white/5"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
              {tab.count > 0 ? (
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    isActive ? "bg-white/20 text-white" : "bg-[#0B8FD8]/10 text-[#0B8FD8]"
                  )}
                >
                  {tab.count > 99 ? "99+" : tab.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </GlassCard>
  );
}

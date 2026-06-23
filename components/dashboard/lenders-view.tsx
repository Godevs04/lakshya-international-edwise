"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { GlassCard } from "@/components/cards/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LenderLogo } from "@/components/lenders/lender-logo";
import type { LenderListItem } from "@/types";

interface LendersViewProps {
  lenders: LenderListItem[];
}

export function LendersView({ lenders }: LendersViewProps) {
  if (lenders.length === 0) {
    return (
      <GlassCard className="p-8">
        <EmptyState
          title="No lenders configured"
          description="Lender records will appear here once seeded."
        />
      </GlassCard>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {lenders.map((lender) => (
        <Link
          key={lender._id}
          href={`/dashboard/students?lenderId=${encodeURIComponent(lender.slug)}`}
        >
          <GlassCard hover className="p-6">
            <div className="flex items-start justify-between gap-4">
              <LenderLogo slug={lender.slug} name={lender.name} size="sm" />
              <div className="flex items-center gap-1.5 rounded-full bg-[#6D5EF7]/10 px-3 py-1 text-xs font-semibold text-[#6D5EF7]">
                <Users className="h-3.5 w-3.5" />
                {lender.applicationCount}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold">{lender.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {lender.applicationCount === 1
                  ? "1 application"
                  : `${lender.applicationCount} applications`}
              </p>
            </div>
          </GlassCard>
        </Link>
      ))}
    </div>
  );
}

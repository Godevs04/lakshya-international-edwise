"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";

interface FollowUpItem {
  id: string;
  firstName: string;
  lastName: string;
  note: string;
  dueDate: Date | string;
  priority?: "high" | "medium" | "low";
}

const PRIORITY_STYLES = {
  high: "from-[#EF4444] to-[#EC4899]",
  medium: "from-[#F59E0B] to-[#EF4444]",
  low: "from-[#6D5EF7] to-[#8B5CF6]",
};

interface FollowUpCardsProps {
  followups: FollowUpItem[];
}

export function FollowUpCards({ followups }: FollowUpCardsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold">Upcoming Follow-ups</h3>
      {followups.map((f, i) => {
        const priority = f.priority ?? (i === 0 ? "high" : i === 1 ? "medium" : "low");
        return (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -2 }}
            className="group flex items-center gap-4 rounded-2xl border border-[#6D5EF7]/10 bg-white/50 p-4 backdrop-blur-sm transition-all hover:border-[#6D5EF7]/20 hover:shadow-lg hover:shadow-[#6D5EF7]/10 dark:bg-white/5"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${PRIORITY_STYLES[priority]} shadow-md`}>
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{f.firstName} {f.lastName}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{f.note}</p>
              <p className="mt-1 text-xs font-medium text-[#6D5EF7]">{formatDate(f.dueDate)}</p>
            </div>
            <Link href={`/dashboard/students/${f.id}`}>
              <Button variant="ghost" size="icon-sm" className="opacity-0 transition-opacity group-hover:opacity-100">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

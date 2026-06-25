"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { getInitials } from "@/lib/utils/format";
import type { StudentStatus } from "@/lib/constants/statuses";

interface StudentListItem {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  status: StudentStatus;
  course?: string;
  partner?: string;
  loanAmount?: string;
}

interface StudentListCardProps {
  students: StudentListItem[];
  viewAllHref?: string;
}

export function StudentListCard({ students, viewAllHref = "/dashboard/students" }: StudentListCardProps) {
  return (
    <div className="space-y-3">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold">Latest Students</h3>
        <Link href={viewAllHref} className="text-xs font-semibold text-[#E8952E] hover:underline">
          View all →
        </Link>
      </div>
      {students.map((s, i) => (
        <Link key={s.id} href={`/dashboard/students/${s.id}`}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ x: 4, scale: 1.01 }}
            className="group flex items-center gap-3 rounded-2xl border border-transparent bg-[#E8952E]/4 p-3 transition-all hover:border-[#E8952E]/15 hover:bg-[#E8952E]/8 hover:shadow-md hover:shadow-[#E8952E]/10"
          >
            <Avatar className="h-10 w-10 ring-2 ring-[#E8952E]/15 transition-all group-hover:ring-[#E8952E]/30">
              <AvatarFallback className="bg-gradient-to-br from-[#E8952E] to-[#F59E0B] text-xs font-bold text-white">
                {getInitials(`${s.firstName} ${s.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{s.firstName} {s.lastName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {s.course ?? s.studentId}
                {s.partner && ` · ${s.partner}`}
              </p>
              {s.loanAmount && (
                <p className="mt-0.5 text-xs font-medium text-[#E8952E]">{s.loanAmount}</p>
              )}
            </div>
            <StatusBadge status={s.status} />
          </motion.div>
        </Link>
      ))}
    </div>
  );
}

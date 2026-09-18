"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StudentLifecycleBadge } from "@/components/dashboard/student-lifecycle-badge";
import { getInitials } from "@/lib/utils/format";
import type { StudentStatus } from "@/lib/constants/statuses";
import {
  closedStudentProfileCardClass,
  getClosedStudentProfileTone,
} from "@/lib/utils/closed-student-profile";
import { cn } from "@/lib/utils";

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

export function StudentListCard({
  students,
  viewAllHref = "/dashboard/students",
}: StudentListCardProps) {
  return (
    <div className="space-y-3">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold">Latest Students</h3>
        <Link href={viewAllHref} className="text-xs font-semibold text-[#0B8FD8] hover:underline">
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
            className={cn(
              "group flex items-center gap-3 rounded-2xl border border-transparent bg-[#0B8FD8]/4 p-3 transition-all hover:border-[#0B8FD8]/15 hover:bg-[#0B8FD8]/8 hover:shadow-md hover:shadow-[#0B8FD8]/10",
              closedStudentProfileCardClass(getClosedStudentProfileTone(s.status))
            )}
          >
            <Avatar className="h-10 w-10 ring-2 ring-[#0B8FD8]/15 transition-all group-hover:ring-[#0B8FD8]/30">
              <AvatarFallback className="bg-gradient-to-br from-[#0B8FD8] to-[#0369A1] text-xs font-bold text-white">
                {getInitials(`${s.firstName} ${s.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {s.firstName} {s.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {s.course ?? s.studentId}
                {s.partner && ` · ${s.partner}`}
              </p>
              {s.loanAmount && (
                <p className="mt-0.5 text-xs font-medium text-[#0B8FD8]">{s.loanAmount}</p>
              )}
            </div>
            <StudentLifecycleBadge status={s.status} />
          </motion.div>
        </Link>
      ))}
    </div>
  );
}

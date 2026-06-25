"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Handshake, FileText, BarChart3 } from "lucide-react";
import { Design06RibbonWaves } from "@/components/layout/design06-ribbon-waves";

interface DashboardHeroProps {
  greeting: string;
  userName: string;
  displayDate: string;
}

const quickActions = [
  {
    href: "/dashboard/students/new",
    label: "Add Student",
    icon: UserPlus,
    gradient: "from-[#6D5EF7] to-[#8B5CF6]",
  },
  {
    href: "/dashboard/partners/new",
    label: "Add Partner",
    icon: Handshake,
    gradient: "from-[#3B82F6] to-[#06B6D4]",
  },
  {
    href: "/dashboard/applications",
    label: "Applications",
    icon: FileText,
    gradient: "from-[#EC4899] to-[#F472B6]",
  },
  {
    href: "/dashboard/reports",
    label: "Generate Report",
    icon: BarChart3,
    gradient: "from-[#22C55E] to-[#10B981]",
  },
];

export function DashboardHero({ greeting, userName, displayDate }: DashboardHeroProps) {
  const firstName = userName.split(" ")[0] ?? userName;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="hero-surface relative min-h-[210px] overflow-hidden rounded-2xl p-5 sm:min-h-[240px] sm:rounded-[28px] sm:p-8"
    >
      <Design06RibbonWaves variant="full" />

      <div className="relative z-10">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm font-medium text-muted-foreground dark:text-slate-300"
        >
          {displayDate}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 max-w-2xl text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50 sm:text-3xl md:text-4xl"
        >
          {greeting},{" "}
          <span className="gradient-text">{firstName}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2 max-w-xl text-base text-muted-foreground dark:text-slate-300"
        >
          Here&apos;s what&apos;s happening with your consultancy today.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:flex sm:flex-wrap sm:gap-3"
        >
          {quickActions.map((action, i) => (
            <Link key={action.href} href={action.href}>
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex w-full items-center gap-2.5 rounded-2xl border border-[#EDE9FE]/80 bg-white/90 px-3 py-2.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-[2px] transition-all hover:border-[#6D5EF7]/18 hover:bg-white hover:shadow-md hover:shadow-[#6D5EF7]/8 dark:border-white/10 dark:bg-slate-950/42 dark:text-slate-100 dark:shadow-black/20 dark:hover:border-[#8B7CF8]/28 dark:hover:bg-slate-950/56 dark:hover:shadow-[#8B7CF8]/10 sm:w-auto sm:px-4 sm:py-3 sm:text-sm"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-md sm:h-9 sm:w-9`}
                >
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                {action.label}
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

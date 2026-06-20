"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Handshake, FileText, BarChart3 } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

interface DashboardHeroProps {
  greeting: string;
  userName: string;
}

const quickActions = [
  { href: "/dashboard/students/new", label: "Add Student", icon: UserPlus, gradient: "from-[#6D5EF7] to-[#8B5CF6]" },
  { href: "/dashboard/partners/new", label: "Add Partner", icon: Handshake, gradient: "from-[#3B82F6] to-[#06B6D4]" },
  { href: "/dashboard/applications", label: "Applications", icon: FileText, gradient: "from-[#22C55E] to-[#10B981]" },
  { href: "/dashboard/reports", label: "Generate Report", icon: BarChart3, gradient: "from-[#F59E0B] to-[#EF4444]" },
];

export function DashboardHero({ greeting, userName }: DashboardHeroProps) {
  const firstName = userName.split(" ")[0] ?? userName;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[28px] hero-banner p-8 text-white shadow-2xl shadow-[#6D5EF7]/25"
    >
      {/* Animated orbs inside hero */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-2xl"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm font-medium text-white/80"
            >
              {formatDate(new Date())}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {greeting}, {firstName} 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-base text-white/75"
            >
              Here&apos;s what&apos;s happening with your consultancy today.
            </motion.p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          {quickActions.map((action, i) => (
            <Link key={action.href} href={action.href}>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-center gap-2.5 rounded-full bg-white/15 px-4 py-2.5 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/25"
              >
                <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${action.gradient}`}>
                  <action.icon className="h-3.5 w-3.5 text-white" />
                </div>
                {action.label}
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

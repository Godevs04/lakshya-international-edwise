"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SidebarLogoMark } from "@/components/brand/sidebar-logo-mark";
import { APP_TAGLINE } from "@/lib/brand/app-logo";
import { cn } from "@/lib/utils";

interface SidebarBrandProps {
  companyName: string;
  logo?: string;
  collapsed?: boolean;
  className?: string;
  linkToOverview?: boolean;
}

export function SidebarBrand({
  companyName,
  logo,
  collapsed = false,
  className,
  linkToOverview = true,
}: SidebarBrandProps) {
  const reducedMotion = useReducedMotion();

  const content = (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cn(
        "group flex w-full",
        collapsed ? "justify-center" : "items-center gap-3.5",
        className
      )}
    >
      <SidebarLogoMark src={logo} alt={companyName} size={collapsed ? "sm" : "md"} />

      {!collapsed ? (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08, duration: 0.4, ease: "easeOut" }}
          className="min-w-0 flex-1 py-0.5"
        >
          <p
            className="text-[13px] font-semibold leading-[1.35] tracking-tight text-sidebar-foreground line-clamp-2"
            title={companyName}
          >
            {companyName}
          </p>
          <p
            className="mt-1 flex items-start gap-1.5 text-[10px] font-medium leading-[1.45] text-sidebar-foreground/65"
            title={APP_TAGLINE}
          >
            <motion.span
              className="mt-0.5 inline-flex shrink-0"
              animate={
                reducedMotion
                  ? undefined
                  : { opacity: [0.45, 1, 0.45], scale: [0.95, 1.05, 0.95] }
              }
              transition={
                reducedMotion
                  ? undefined
                  : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <Sparkles className="h-3 w-3 text-primary" aria-hidden />
            </motion.span>
            <span className="line-clamp-2">{APP_TAGLINE}</span>
          </p>
        </motion.div>
      ) : null}
    </motion.div>
  );

  if (linkToOverview) {
    return (
      <Link
        href="/dashboard/overview"
        className="block rounded-2xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/25"
      >
        {content}
      </Link>
    );
  }

  return content;
}

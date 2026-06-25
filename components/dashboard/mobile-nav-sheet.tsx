"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  filterNavItems,
  isNavItemActive,
  type NavItem,
} from "@/components/dashboard/nav-config";
import { SidebarBrand } from "@/components/brand/sidebar-brand";
import type { AppModules } from "@/types";

interface MobileNavSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  logo?: string;
  modules?: AppModules;
  items?: NavItem[];
}

export function MobileNavSheet({
  open,
  onOpenChange,
  companyName,
  logo,
  modules,
  items,
}: MobileNavSheetProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const filteredNav = items ?? filterNavItems(modules, session?.user?.permissions);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sidebar-solid w-[min(100vw-2rem,320px)] border-white/10 p-0 text-white">
        <SheetHeader className="border-b border-white/10 px-4 py-3.5 text-left">
          <SidebarBrand companyName={companyName} logo={logo} linkToOverview={false} />
        </SheetHeader>
        <nav className="space-y-1 p-3">
          {filteredNav.map((item) => {
            const isActive = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-[#7C6CF8] to-[#9B8AFB] text-white shadow-md"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

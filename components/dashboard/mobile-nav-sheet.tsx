"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  filterNavItems,
  isNavItemActive,
  type NavItem,
} from "@/components/dashboard/nav-config";
import { AppLogo } from "@/components/brand/app-logo";
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
      <SheetContent side="right" className="w-[min(100vw-2rem,320px)] glass-sidebar border-[#6D5EF7]/15 p-0">
        <SheetHeader className="border-b border-[#6D5EF7]/10 px-5 py-4 text-left">
          <div className="flex items-center gap-3">
            <AppLogo src={logo} alt={companyName} variant="mobile" />
            <SheetTitle className="text-base font-bold">{companyName}</SheetTitle>
          </div>
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
                      ? "bg-gradient-to-r from-[#6D5EF7] to-[#8B5CF6] text-white shadow-md"
                      : "text-muted-foreground hover:bg-[#6D5EF7]/8"
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

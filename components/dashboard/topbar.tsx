"use client";

import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  Moon,
  Sun,
  Monitor,
  LogOut,
  User,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/format";
import { GlobalSearch } from "@/components/dashboard/global-search";
import { useState } from "react";

interface TopbarProps {
  unreadCount?: number;
}

export function Topbar({ unreadCount = 0 }: TopbarProps) {
  const { data: session } = useSession();
  const { setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 px-1 lg:px-0">
        {/* Premium Search */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setSearchOpen(true)}
          className="search-glow group relative flex h-11 flex-1 max-w-md items-center gap-3 rounded-full border border-[#6D5EF7]/15 bg-white/60 px-5 backdrop-blur-xl transition-all dark:bg-white/5"
        >
          <Search className="h-4 w-4 text-[#6D5EF7]/60 transition-colors group-hover:text-[#6D5EF7]" />
          <span className="text-sm text-muted-foreground">Search students, partners...</span>
          <kbd className="pointer-events-none ml-auto hidden h-6 select-none items-center gap-0.5 rounded-full border border-[#6D5EF7]/15 bg-[#6D5EF7]/5 px-2 font-mono text-[10px] font-medium text-[#6D5EF7] sm:flex">
            <span>⌘</span>K
          </kbd>
        </motion.button>

        <div className="ml-auto flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#6D5EF7]/10 bg-white/60 backdrop-blur-xl transition-all hover:bg-[#6D5EF7]/8 dark:bg-white/5">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#EF4444] to-[#EC4899] text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-2xl border-[#6D5EF7]/10 bg-white/95 backdrop-blur-xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-semibold">Notifications</DropdownMenuLabel>
                <DropdownMenuItem disabled className="text-muted-foreground">
                  No new notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#6D5EF7]/10 bg-white/60 backdrop-blur-xl transition-all hover:bg-[#6D5EF7]/8 dark:bg-white/5">
              <Sun className="h-4 w-4 rotate-0 scale-100 text-muted-foreground transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 text-muted-foreground transition-all dark:rotate-0 dark:scale-100" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-[#6D5EF7]/10 bg-white/95 backdrop-blur-xl">
              <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-xl">
                <Sun className="mr-2 h-4 w-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-xl">
                <Moon className="mr-2 h-4 w-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="rounded-xl">
                <Monitor className="mr-2 h-4 w-4" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="hidden sm:inline-flex">
              <Avatar className="h-10 w-10 ring-2 ring-[#6D5EF7]/20 transition-all hover:ring-[#6D5EF7]/40">
                <AvatarImage src={session?.user?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-[#6D5EF7] to-[#8B5CF6] text-xs text-white">
                  {getInitials(session?.user?.name ?? "U")}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl border-[#6D5EF7]/10 bg-white/95 backdrop-blur-xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">{session?.user?.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {session?.user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="rounded-xl">
                  <Link href="/dashboard/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="rounded-xl text-[#EF4444]"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

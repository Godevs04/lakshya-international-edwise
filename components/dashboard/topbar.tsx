"use client";

import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  Moon,
  Sun,
  Monitor,
  LogOut,
  User,
  Search,
  CheckCheck,
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
import { useSearchShortcutLabel } from "@/hooks/use-search-shortcut";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type ClientNotification,
} from "@/lib/actions/notification.actions";
import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";

interface TopbarProps {
  unreadCount?: number;
  notifications?: ClientNotification[];
}

export function Topbar({ unreadCount = 0, notifications = [] }: TopbarProps) {
  const { data: session } = useSession();
  const { setTheme } = useTheme();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const searchShortcutLabel = useSearchShortcutLabel();

  function handleNotificationClick(notification: ClientNotification) {
    startTransition(async () => {
      if (!notification.read) {
        await markNotificationReadAction(notification.id);
      }
      if (notification.link) {
        router.push(notification.link);
      }
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
    });
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex min-h-14 flex-wrap items-center gap-2 sm:gap-3 lg:min-h-16">
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setSearchOpen(true)}
          aria-label={`Search students, partners, and applications (${searchShortcutLabel})`}
          className="search-glow group relative flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full border border-[#6D5EF7]/15 bg-white/60 px-3 backdrop-blur-xl transition-all sm:h-11 sm:gap-3 sm:px-5 lg:max-w-md dark:bg-white/5"
        >
          <Search className="h-4 w-4 shrink-0 text-[#6D5EF7]/60 transition-colors group-hover:text-[#6D5EF7]" />
          <span className="min-w-0 truncate text-sm text-muted-foreground">
            <span className="hidden sm:inline">Search students, partners...</span>
            <span className="sm:hidden">Search...</span>
          </span>
          <kbd className="pointer-events-none ml-auto hidden h-6 shrink-0 select-none items-center rounded-full border border-[#6D5EF7]/15 bg-[#6D5EF7]/5 px-2 font-mono text-[10px] font-medium text-[#6D5EF7] sm:flex">
            {searchShortcutLabel}
          </kbd>
        </motion.button>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#6D5EF7]/10 bg-white/60 backdrop-blur-xl transition-all hover:bg-[#6D5EF7]/8 sm:h-10 sm:w-10 dark:bg-white/5">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#EF4444] to-[#EC4899] text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(calc(100vw-2rem),20rem)] rounded-2xl border-[#6D5EF7]/10 bg-white/95 backdrop-blur-xl">
              <DropdownMenuGroup>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <DropdownMenuLabel className="p-0 font-semibold">
                    Notifications
                  </DropdownMenuLabel>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      disabled={pending}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <CheckCheck className="h-3 w-3" />
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    No new notifications
                  </DropdownMenuItem>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="cursor-pointer flex-col items-start gap-0.5 py-2"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <span
                        className={`text-sm font-medium ${notification.read ? "text-muted-foreground" : "text-foreground"}`}
                      >
                        {notification.title}
                      </span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {notification.body}
                      </span>
                      <span className="text-[10px] text-muted-foreground/80">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#6D5EF7]/10 bg-white/60 backdrop-blur-xl transition-all hover:bg-[#6D5EF7]/8 sm:h-10 sm:w-10 dark:bg-white/5">
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
            <DropdownMenuTrigger className="inline-flex">
              <Avatar className="h-9 w-9 ring-2 ring-[#6D5EF7]/20 transition-all hover:ring-[#6D5EF7]/40 sm:h-10 sm:w-10">
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
                  onClick={async () => {
                    await signOut({ redirect: false });
                    window.location.assign("/login");
                  }}
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

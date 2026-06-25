"use client";

import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Bell,
  Moon,
  Sun,
  Monitor,
  LogOut,
  User,
  Search,
  CheckCheck,
  Menu,
  Loader2,
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
import { useSearchShortcutLabel } from "@/hooks/use-search-shortcut";
import {
  getNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type ClientNotification,
} from "@/lib/actions/notification.actions";
import { useState, useTransition, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { MobileNavSheet } from "@/components/dashboard/mobile-nav-sheet";
import type { AppModules } from "@/types";

const GlobalSearch = dynamic(
  () => import("@/components/dashboard/global-search").then((m) => m.GlobalSearch),
  { ssr: false }
);

interface TopbarUser {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
}

interface TopbarProps {
  unreadCount?: number;
  companyName: string;
  logo?: string;
  modules?: AppModules;
  user?: TopbarUser;
}

export function Topbar({
  unreadCount = 0,
  companyName,
  logo,
  modules,
  user: serverUser,
}: TopbarProps) {
  const { data: session } = useSession();
  const user = session?.user ?? serverUser;
  const { setTheme } = useTheme();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [pending, startTransition] = useTransition();
  const searchShortcutLabel = useSearchShortcutLabel();

  const loadNotifications = useCallback(async () => {
    if (notificationsLoaded || notificationsLoading) return;
    setNotificationsLoading(true);
    try {
      const items = await getNotificationsAction();
      setNotifications(items);
      setNotificationsLoaded(true);
    } finally {
      setNotificationsLoading(false);
    }
  }, [notificationsLoaded, notificationsLoading]);

  function handleNotificationsOpenChange(open: boolean) {
    setNotificationsOpen(open);
    if (open) {
      void loadNotifications();
    }
  }

  function handleNotificationClick(notification: ClientNotification) {
    startTransition(async () => {
      if (!notification.read) {
        await markNotificationReadAction(notification.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, read: true } : item
          )
        );
      }
      if (notification.link) {
        router.push(notification.link);
      }
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    });
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex min-h-12 flex-wrap items-center gap-2 sm:min-h-14 sm:gap-3">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full glass-surface transition-all hover:bg-[#E8952E]/8 lg:hidden dark:bg-white/5"
        >
          <Menu className="h-5 w-5 text-[#E8952E]" />
        </button>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label={`Search students, partners, and applications (${searchShortcutLabel})`}
          className="search-glow group relative flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full glass-surface px-3 transition-all sm:h-11 sm:gap-3 sm:px-5 lg:max-w-md dark:bg-white/5"
        >
          <Search className="h-4 w-4 shrink-0 text-[#E8952E]/60 transition-colors group-hover:text-[#E8952E]" />
          <span className="min-w-0 truncate text-sm text-muted-foreground">
            <span className="hidden sm:inline">Search students, partners...</span>
            <span className="sm:hidden">Search...</span>
          </span>
          <kbd className="pointer-events-none ml-auto hidden h-6 shrink-0 select-none items-center rounded-full border border-[#E8952E]/15 bg-[#E8952E]/5 px-2 font-mono text-[10px] font-medium text-[#E8952E] sm:flex">
            {searchShortcutLabel}
          </kbd>
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
          <DropdownMenu open={notificationsOpen} onOpenChange={handleNotificationsOpenChange}>
            <DropdownMenuTrigger className="relative inline-flex h-9 w-9 items-center justify-center rounded-full glass-surface transition-all hover:bg-[#E8952E]/8 sm:h-10 sm:w-10 dark:bg-white/5">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#EF4444] to-[#EC4899] text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[min(calc(100vw-2rem),20rem)] rounded-2xl border-border bg-popover/95 text-popover-foreground shadow-lg backdrop-blur-xl"
            >
              <DropdownMenuGroup>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <DropdownMenuLabel className="p-0 font-semibold text-foreground">
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
                {notificationsLoading ? (
                  <DropdownMenuItem disabled className="justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </DropdownMenuItem>
                ) : notifications.length === 0 ? (
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
            <DropdownMenuTrigger className="relative hidden h-9 w-9 items-center justify-center rounded-full glass-surface transition-all hover:bg-[#E8952E]/8 sm:inline-flex sm:h-10 sm:w-10 dark:bg-white/5">
              <Sun className="h-4 w-4 rotate-0 scale-100 text-muted-foreground transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 text-muted-foreground transition-all dark:rotate-0 dark:scale-100" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-2xl border-border bg-popover/95 text-popover-foreground shadow-lg backdrop-blur-xl"
            >
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
              <Avatar className="h-9 w-9 ring-2 ring-[#E8952E]/20 transition-all hover:ring-[#E8952E]/40 sm:h-10 sm:w-10">
                <AvatarImage src={user?.avatar ?? undefined} />
                <AvatarFallback className="bg-gradient-to-br from-[#E8952E] to-[#F59E0B] text-xs text-white">
                  {getInitials(user?.name ?? "U")}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-2xl border-border bg-popover/95 text-popover-foreground shadow-lg backdrop-blur-xl"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-foreground">
                  <div className="flex flex-col">
                    <span className="font-semibold">{user?.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user?.email}
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

      <MobileNavSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        companyName={companyName}
        logo={logo}
        modules={modules}
      />

      {searchOpen ? (
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      ) : null}
    </>
  );
}

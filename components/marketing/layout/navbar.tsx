"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Search, LogIn } from "lucide-react";
import { MARKETING_NAV } from "@/lib/constants/marketing/navigation";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/brand/app-logo";

interface MarketingNavbarProps {
  companyName: string;
}

export function MarketingNavbar({ companyName }: MarketingNavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filteredNav = MARKETING_NAV.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      item.children?.some((child) => child.label.toLowerCase().includes(q))
    );
  });

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-border/80 bg-white/95 shadow-sm backdrop-blur-md"
          : "border-transparent bg-white/70 backdrop-blur-sm"
      )}
    >
      <div className="container mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <AppLogo alt={companyName} variant="mobile" />
          <span className="hidden max-w-[10rem] truncate text-sm font-semibold text-secondary sm:inline">
            {companyName}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {MARKETING_NAV.map((item) => (
            <div key={item.href} className="group relative">
              <Link
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-primary/10 text-primary"
                    : "text-secondary/80 hover:bg-muted hover:text-secondary"
                )}
              >
                {item.label}
                {item.children && <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
              </Link>
              {item.children && (
                <div className="invisible absolute left-0 top-full z-50 min-w-[220px] rounded-xl border border-border bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block rounded-lg px-3 py-2 text-sm text-secondary/80 hover:bg-muted hover:text-secondary"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu"
              className="h-9 w-40 rounded-full border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-48"
            />
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-secondary/80 hover:bg-muted"
          >
            <LogIn className="h-4 w-4" />
            Staff Login
          </Link>
          <Link href="/contact" className="btn-marketing rounded-full px-4 py-2 text-sm font-semibold">
            Book Consultation
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border lg:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-white px-4 py-4 lg:hidden">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu"
            className="mb-3 h-10 w-full rounded-full border border-input px-4 text-sm"
          />
          <div className="space-y-1">
            {filteredNav.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-secondary hover:bg-muted"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-3 border-l border-border pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-secondary"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/login" className="rounded-full border border-border px-4 py-2 text-center text-sm font-medium">
              Staff Login
            </Link>
            <Link href="/contact" className="btn-marketing rounded-full px-4 py-2 text-center text-sm font-semibold">
              Book Consultation
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

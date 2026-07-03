"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, LogIn } from "lucide-react";
import { MARKETING_NAV } from "@/lib/constants/marketing/navigation";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/brand/app-logo";
import { MegaMenu } from "@/components/marketing/layout/mega-menu";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import type { MegaMenuType } from "@/types/marketing";

interface MarketingNavbarProps {
  companyName: string;
}

export function MarketingNavbar({ companyName }: MarketingNavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMega, setOpenMega] = useState<MegaMenuType | null>(null);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMega = useCallback(() => setOpenMega(null), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMega(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-white/40 bg-white/80 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-white/60 backdrop-blur-md"
      )}
    >
      <div className="container mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <AppLogo alt={companyName} variant="mobile" />
          <span className="hidden max-w-[11rem] truncate text-sm font-semibold text-secondary sm:inline">
            {companyName}
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
          {MARKETING_NAV.map((item) => {
            const hasMega = item.megaMenu && item.megaMenu !== "none";
            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => hasMega && setOpenMega(item.megaMenu!)}
                onMouseLeave={() => hasMega && setOpenMega(null)}
              >
                <Link
                  href={item.href}
                  aria-expanded={hasMega ? openMega === item.megaMenu : undefined}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3.5 py-2.5 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-secondary/80 hover:bg-muted hover:text-secondary"
                  )}
                >
                  {item.label}
                  {hasMega && (
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 opacity-60 transition-transform",
                        openMega === item.megaMenu && "rotate-180"
                      )}
                    />
                  )}
                </Link>
                {hasMega && item.megaMenu && item.megaMenu !== "none" && (
                  <MegaMenu
                    type={item.megaMenu}
                    isOpen={openMega === item.megaMenu}
                    onClose={closeMega}
                  />
                )}
              </div>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-sm font-medium text-secondary/80 transition-colors hover:bg-muted"
          >
            <LogIn className="h-4 w-4" />
            Staff Login
          </Link>
          <EligibilityCta source="navbar" className="px-5 py-2.5 text-sm" />
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border lg:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-white px-4 py-4 lg:hidden">
          <div className="space-y-1">
            {MARKETING_NAV.map((item) => (
              <div key={item.href}>
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedMobile((current) =>
                          current === item.href ? null : item.href
                        )
                      }
                      className="rounded-lg p-2 text-muted-foreground"
                      aria-expanded={expandedMobile === item.href}
                      aria-label={`Expand ${item.label} menu`}
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          expandedMobile === item.href && "rotate-180"
                        )}
                      />
                    </button>
                  )}
                </div>
                {item.children && expandedMobile === item.href && (
                  <div className="ml-3 border-l border-border pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-secondary",
                          child.href.includes("#") && "pl-6 text-xs"
                        )}
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
            <Link href="/login" className="rounded-full border border-border px-4 py-2.5 text-center text-sm font-medium">
              Staff Login
            </Link>
            <EligibilityCta
              source="navbar-mobile"
              onClick={() => setMobileOpen(false)}
              className="w-full px-4 py-2.5 text-sm"
            />
          </div>
        </div>
      )}
    </header>
  );
}

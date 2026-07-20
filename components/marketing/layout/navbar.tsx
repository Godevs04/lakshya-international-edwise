"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useHydrationSafeReducedMotion } from "@/lib/motion/use-hydration-safe-reduced-motion";
import { Menu, X, ChevronDown, LogIn, ArrowRight } from "lucide-react";
import { MARKETING_NAV } from "@/lib/constants/marketing/navigation";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/brand/app-logo";
import { MegaMenu } from "@/components/marketing/layout/mega-menu";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { useNavbarScroll } from "@/hooks/use-navbar-scroll";
import type { MarketingNavItem, MegaMenuType } from "@/types/marketing";

interface MarketingNavbarProps {
  companyName: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const NAV_SPRING = { type: "spring" as const, stiffness: 420, damping: 34 };

const REGULAR_NAV = MARKETING_NAV.filter((item) => !item.featured);
const FEATURED_NAV = MARKETING_NAV.filter((item) => item.featured);

function NavLabel({ item }: { item: MarketingNavItem }) {
  return <>{item.shortLabel ?? item.label}</>;
}

function useNavActive() {
  const pathname = usePathname();

  return useCallback(
    (href: string) => {
      if (href.includes("#")) return false;
      return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
    },
    [pathname]
  );
}

interface NavItemLinkProps {
  item: MarketingNavItem;
  active: boolean;
  prefersReducedMotion: boolean | null;
  showJoinBadge?: boolean;
  className?: string;
}

function NavItemLink({
  item,
  active,
  prefersReducedMotion,
  showJoinBadge = false,
  className,
}: NavItemLinkProps) {
  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="relative"
    >
      <Link
        href={item.href}
        className={cn(
          "nav-item group relative inline-flex h-11 items-center gap-1 rounded-full px-2 text-sm font-medium text-secondary/80 transition-[color,background,box-shadow] duration-[250ms] xl:px-2.5 2xl:px-3.5",
          "hover:text-secondary hover:shadow-[0_0_0_4px_rgba(11,143,216,0.08)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          active && "nav-item-active text-primary",
          showJoinBadge && "mr-0.5 pr-5",
          className
        )}
      >
        <NavLabel item={item} />
        {showJoinBadge && (
          <span className="nav-partner-badge" aria-hidden>
            Join
          </span>
        )}
        {active && (
          <motion.span
            layoutId="nav-active-indicator"
            className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-primary"
            transition={prefersReducedMotion ? { duration: 0 } : NAV_SPRING}
          />
        )}
      </Link>
    </motion.div>
  );
}

interface DesktopNavItemProps {
  item: MarketingNavItem;
  active: boolean;
  openMega: MegaMenuType | null;
  onMegaOpen: (type: MegaMenuType) => void;
  onMegaClose: () => void;
  prefersReducedMotion: boolean | null;
}

function DesktopNavItem({
  item,
  active,
  openMega,
  onMegaOpen,
  onMegaClose,
  prefersReducedMotion,
}: DesktopNavItemProps) {
  const hasMega = item.megaMenu && item.megaMenu !== "none";

  return (
    <div
      className="relative"
      onMouseEnter={() => hasMega && onMegaOpen(item.megaMenu!)}
      onMouseLeave={() => hasMega && onMegaClose()}
    >
      <motion.div
        whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.25, ease: EASE }}
      >
        <Link
          href={item.href}
          aria-expanded={hasMega ? openMega === item.megaMenu : undefined}
          className={cn(
            "nav-item group relative inline-flex h-11 items-center gap-1 rounded-full px-2 text-sm font-medium text-secondary/80 transition-[color,background,box-shadow] duration-[250ms] xl:px-2.5 2xl:px-3.5",
            "hover:text-secondary hover:shadow-[0_0_0_4px_rgba(11,143,216,0.08)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            active && "nav-item-active text-primary"
          )}
        >
          <NavLabel item={item} />
          {hasMega && (
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 opacity-50 transition-transform duration-[250ms]",
                openMega === item.megaMenu && "rotate-180 opacity-80"
              )}
            />
          )}
          {active && (
            <motion.span
              layoutId="nav-active-indicator"
              className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-primary"
              transition={prefersReducedMotion ? { duration: 0 } : NAV_SPRING}
            />
          )}
        </Link>
      </motion.div>

      {hasMega && item.megaMenu && item.megaMenu !== "none" && (
        <MegaMenu
          type={item.megaMenu}
          isOpen={openMega === item.megaMenu}
          onClose={onMegaClose}
        />
      )}
    </div>
  );
}

interface MobileNavLinkProps {
  item: MarketingNavItem;
  active: boolean;
  prefersReducedMotion: boolean | null;
  onNavigate: () => void;
}

function MobileNavLink({
  item,
  active,
  prefersReducedMotion,
  onNavigate,
}: MobileNavLinkProps) {
  return (
    <motion.div
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="flex-1"
    >
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "nav-item group relative flex h-11 w-full items-center rounded-xl px-3 text-sm font-medium text-secondary/80 transition-[color,background,box-shadow] duration-[250ms]",
          "active:shadow-[0_0_0_4px_rgba(11,143,216,0.08)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          active && "nav-item-active text-primary",
          item.featured && "pr-6"
        )}
      >
        {item.label}
        {item.featured && (
          <span className="nav-partner-badge" aria-hidden>
            Join
          </span>
        )}
        {active && (
          <motion.span
            layoutId="nav-active-indicator"
            className="absolute inset-x-3 bottom-1.5 h-0.5 rounded-full bg-primary"
            transition={prefersReducedMotion ? { duration: 0 } : NAV_SPRING}
          />
        )}
      </Link>
    </motion.div>
  );
}

export function MarketingNavbar({ companyName }: MarketingNavbarProps) {
  const isActive = useNavActive();
  const { compact, progress } = useNavbarScroll();
  const prefersReducedMotion = useHydrationSafeReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMega, setOpenMega] = useState<MegaMenuType | null>(null);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);

  const closeMega = useCallback(() => setOpenMega(null), []);
  const openMegaMenu = useCallback((type: MegaMenuType) => setOpenMega(type), []);

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

  return (
    <header
      className={cn(
        "marketing-navbar sticky top-0 z-50 transition-[background,box-shadow,height] duration-[250ms] ease-out",
        compact
          ? "is-compact bg-white/95 shadow-[0_4px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl"
          : "bg-white/80 backdrop-blur-lg"
      )}
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left bg-gradient-to-r from-primary/60 to-primary"
        style={{ scaleX: progress }}
        aria-hidden
      />

      <div
        className={cn(
          "container mx-auto flex max-w-[88rem] items-center px-5 transition-[height] duration-[250ms] lg:px-8",
          compact ? "h-[68px]" : "h-20"
        )}
      >
        {/* LEFT bookend — Logo + company name */}
        <div className="hidden min-w-0 flex-1 items-center justify-start lg:flex">
          <Link
            href="/"
            className="group relative z-10 flex min-w-0 max-w-full items-center gap-2.5"
            aria-label={`${companyName} home`}
          >
            <motion.div
              className="flex shrink-0 items-center origin-left"
              animate={{ scale: compact ? 0.9 : 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: EASE }}
            >
              <AppLogo
                alt={companyName}
                variant="mobile"
                className="!h-9 !max-w-[3rem] !rounded-xl !px-2 !py-1 !shadow-sm !ring-1 !ring-black/[0.04] transition-shadow duration-[250ms] group-hover:!shadow-md"
              />
            </motion.div>
            <span className="hidden min-w-0 truncate text-sm font-semibold tracking-tight text-secondary transition-colors duration-[250ms] group-hover:text-primary min-[1680px]:inline">
              {companyName}
            </span>
          </Link>
        </div>

        {/* Mobile logo */}
        <Link
          href="/"
          className="group relative z-10 flex shrink-0 items-center gap-2.5 lg:hidden"
          aria-label={`${companyName} home`}
        >
          <AppLogo
            alt={companyName}
            variant="mobile"
            className="!h-9 !max-w-[3rem] !rounded-xl !px-2 !py-1 !shadow-sm !ring-1 !ring-black/[0.04]"
          />
        </Link>

        {/* CENTER — Single glass navigation container */}
        <div className="hidden shrink-0 px-3 lg:block xl:px-4">
          <LayoutGroup id="marketing-nav">
            <nav
              className="nav-glass flex items-center gap-0.5 xl:gap-1"
              aria-label="Main navigation"
            >
              {REGULAR_NAV.map((item) => (
                <DesktopNavItem
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  openMega={openMega}
                  onMegaOpen={openMegaMenu}
                  onMegaClose={closeMega}
                  prefersReducedMotion={prefersReducedMotion}
                />
              ))}
            </nav>
          </LayoutGroup>
        </div>

        {/* RIGHT bookend — Partner, Staff Portal, CTA */}
        <div className="relative z-20 hidden min-w-0 flex-1 items-center justify-end gap-2.5 md:flex lg:gap-3 xl:gap-4">
          {FEATURED_NAV.map((item) => (
            <NavItemLink
              key={item.href}
              item={item}
              active={isActive(item.href)}
              prefersReducedMotion={prefersReducedMotion}
              showJoinBadge
            />
          ))}

          <Link
            href="/login"
            aria-label="Staff portal login"
            className="group inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-secondary opacity-70 transition-[opacity,color] duration-[250ms] hover:text-secondary hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <LogIn className="h-4 w-4" aria-hidden />
            <span className="hidden xl:inline">Staff Portal</span>
          </Link>

          <EligibilityCta
            source="navbar"
            className="nav-eligibility-cta group"
          >
            Check Eligibility
            <ArrowRight
              className="h-4 w-4 transition-transform duration-[250ms] ease-out group-hover:translate-x-1"
              aria-hidden
            />
          </EligibilityCta>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 text-secondary transition-colors duration-[250ms] hover:border-primary/25 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
        >
          <motion.span
            key={mobileOpen ? "close" : "menu"}
            initial={prefersReducedMotion ? false : { opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="inline-flex"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </motion.span>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-xl lg:hidden"
          >
            <div className="px-5 py-4">
              <LayoutGroup id="marketing-nav-mobile">
                <nav className="nav-glass-mobile space-y-0.5 rounded-2xl p-2" aria-label="Mobile navigation">
                  {MARKETING_NAV.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.25, ease: EASE }}
                    >
                      <div className="flex items-center">
                        <MobileNavLink
                          item={item}
                          active={isActive(item.href)}
                          prefersReducedMotion={prefersReducedMotion}
                          onNavigate={() => setMobileOpen(false)}
                        />
                        {item.children && (
                          <motion.button
                            type="button"
                            whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
                            onClick={() =>
                              setExpandedMobile((current) =>
                                current === item.href ? null : item.href
                              )
                            }
                            className="rounded-lg p-2 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            aria-expanded={expandedMobile === item.href}
                            aria-label={`Expand ${item.label} menu`}
                          >
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform duration-[250ms]",
                                expandedMobile === item.href && "rotate-180"
                              )}
                            />
                          </motion.button>
                        )}
                      </div>
                      <AnimatePresence>
                        {item.children && expandedMobile === item.href && (
                          <motion.div
                            initial={prefersReducedMotion ? false : { opacity: 0, height: 0, filter: "blur(4px)" }}
                            animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
                            exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0, filter: "blur(4px)" }}
                            transition={{ duration: 0.25, ease: EASE }}
                            className="ml-3 overflow-hidden border-l border-slate-200 pl-3"
                          >
                            {item.children.map((child, childIndex) => (
                              <motion.div
                                key={child.href}
                                initial={prefersReducedMotion ? false : { opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: childIndex * 0.03, duration: 0.2, ease: EASE }}
                              >
                                <Link
                                  href={child.href}
                                  onClick={() => setMobileOpen(false)}
                                  className={cn(
                                    "block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                    child.href.includes("#") && "pl-6 text-xs"
                                  )}
                                >
                                  {child.label}
                                </Link>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </nav>
              </LayoutGroup>

              <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-secondary/70 transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <LogIn className="h-4 w-4" />
                  Staff Portal
                </Link>
                <EligibilityCta
                  source="navbar-mobile"
                  onClick={() => setMobileOpen(false)}
                  className="nav-eligibility-cta group w-full"
                >
                  Check Eligibility
                  <ArrowRight className="h-4 w-4 transition-transform duration-[250ms] group-hover:translate-x-1" />
                </EligibilityCta>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

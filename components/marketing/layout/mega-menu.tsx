"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MARKETING_SERVICES } from "@/lib/constants/marketing/services";
import { MARKETING_COUNTRIES } from "@/lib/constants/marketing/countries";
import { getEducationLoanOptionHref } from "@/lib/constants/marketing/education-loan-options";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import { getCountryFlagLabel } from "@/lib/constants/marketing/countries";
import type { MarketingService, MarketingServiceSubOption } from "@/types/marketing";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MegaMenuProps {
  type: "services" | "countries" | "resources";
  isOpen: boolean;
  onClose: () => void;
}

export function MegaMenu({ type, isOpen, onClose }: MegaMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 6, filter: "blur(4px)" }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mega-menu-panel absolute left-0 top-full z-50 mt-2 p-0"
          role="menu"
          onMouseLeave={onClose}
        >
          {type === "services" && <ServicesMegaMenu onClose={onClose} />}
          {type === "countries" && <CountriesMegaMenu onClose={onClose} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ServiceDetailLink({
  href,
  icon,
  title,
  description,
  onClose,
}: {
  href: string;
  icon: string;
  title: string;
  description?: string;
  onClose: () => void;
}) {
  return (
    <Link href={href} onClick={onClose} role="menuitem" className="mega-menu-detail-link group">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm ring-1 ring-primary/10">
        <MarketingIcon name={icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground group-hover:text-primary">
          {title}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {description}
          </span>
        ) : null}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

function ServiceDetailPanel({
  service,
  onClose,
}: {
  service: MarketingService;
  onClose: () => void;
}) {
  const subOptions = service.subOptions ?? [];

  if (subOptions.length > 0) {
    return (
      <div className="space-y-1">
        {subOptions.map((option: MarketingServiceSubOption, index) => (
          <motion.div
            key={option.slug}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.18,
              delay: index * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <ServiceDetailLink
              href={getEducationLoanOptionHref(option.slug)}
              icon={option.icon}
              title={option.title}
              description={option.shortDescription}
              onClose={onClose}
            />
          </motion.div>
        ))}
        <div className="mt-3 border-t border-primary/10 pt-3">
          <Link
            href={`/services/${service.slug}`}
            onClick={onClose}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            View all education loan options
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ServiceDetailLink
        href={`/services/${service.slug}`}
        icon={service.icon}
        title={service.title}
        description={service.shortDescription}
        onClose={onClose}
      />
      <ul className="space-y-2 pl-1">
        {service.highlights.slice(0, 3).map((highlight) => (
          <li
            key={highlight}
            className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
          >
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
            {highlight}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ServicesMegaMenu({ onClose }: { onClose: () => void }) {
  const [activeSlug, setActiveSlug] = useState(MARKETING_SERVICES[0]?.slug ?? "education-loan");
  const activeService =
    MARKETING_SERVICES.find((service) => service.slug === activeSlug) ?? MARKETING_SERVICES[0];

  if (!activeService) return null;

  return (
    <div className="mega-menu-tabbed">
      <div className="mega-menu-sidebar" role="tablist" aria-label="Service categories">
        {MARKETING_SERVICES.map((service) => {
          const isActive = service.slug === activeSlug;
          return (
            <button
              key={service.slug}
              type="button"
              role="tab"
              aria-selected={isActive}
              onMouseEnter={() => setActiveSlug(service.slug)}
              onFocus={() => setActiveSlug(service.slug)}
              className={cn(
                "mega-menu-sidebar-item",
                isActive && "mega-menu-sidebar-item-active"
              )}
            >
              <span>{service.title}</span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 transition-opacity",
                  isActive ? "opacity-100" : "opacity-0"
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="mega-menu-detail" role="tabpanel">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeService.slug}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <ServiceDetailPanel service={activeService} onClose={onClose} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function CountriesMegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-[min(90vw,560px)] p-4">
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Loan Destinations
        </p>
        <Link
          href="/countries"
          onClick={onClose}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid gap-1 sm:grid-cols-2">
        {MARKETING_COUNTRIES.map((country) => (
          <Link
            key={country.slug}
            href={`/countries/${country.slug}`}
            onClick={onClose}
            role="menuitem"
            className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted"
          >
            {country.image ? (
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/5">
                <Image
                  src={country.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </span>
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                {getCountryFlagLabel(country)}
              </span>
            )}
            <span>
              <span className="block text-sm font-semibold text-secondary">{country.name}</span>
              {country.tuitionRange && (
                <span className="text-xs text-muted-foreground">{country.tuitionRange}</span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

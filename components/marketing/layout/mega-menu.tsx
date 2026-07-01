"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { MarketingNavItem } from "@/types/marketing";
import { MARKETING_SERVICES } from "@/lib/constants/marketing/services";
import { MARKETING_COUNTRIES } from "@/lib/constants/marketing/countries";
import { MARKETING_RESOURCES } from "@/lib/constants/marketing/navigation";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import { getCountryFlagLabel } from "@/lib/constants/marketing/countries";
import { ArrowRight } from "lucide-react";

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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mega-menu-panel absolute left-0 top-full z-50 mt-2 p-4"
          role="menu"
          onMouseLeave={onClose}
        >
          {type === "services" && <ServicesMegaMenu onClose={onClose} />}
          {type === "countries" && <CountriesMegaMenu onClose={onClose} />}
          {type === "resources" && <ResourcesMegaMenu onClose={onClose} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ServicesMegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-[min(90vw,640px)]">
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Our Services
        </p>
        <Link
          href="/services"
          onClick={onClose}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid gap-1 sm:grid-cols-2">
        {MARKETING_SERVICES.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              onClick={onClose}
              role="menuitem"
              className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MarketingIcon name={service.icon} className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-secondary">{service.title}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-1">
                  {service.shortDescription}
                </span>
              </span>
            </Link>
        ))}
      </div>
    </div>
  );
}

function CountriesMegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-[min(90vw,560px)]">
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Study Destinations
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
            className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
              {getCountryFlagLabel(country)}
            </span>
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

function ResourcesMegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-56">
      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Resources
      </p>
      {MARKETING_RESOURCES.map((item: MarketingNavItem) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          role="menuitem"
          className="block rounded-lg px-3 py-2 text-sm text-secondary/80 transition-colors hover:bg-muted hover:text-secondary"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

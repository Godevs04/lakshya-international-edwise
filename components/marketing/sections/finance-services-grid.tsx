"use client";

import Link from "next/link";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { MARKETING_SERVICES } from "@/lib/constants/marketing/services";
import { ArrowRight } from "lucide-react";

export function FinanceServicesGrid() {
  return (
    <SectionShell
      variant="white"
      eyebrow="Our Services"
      title="Everything you need to fund your education abroad"
      description="One finance partner for loans, forex, blocked accounts, and more — so you can focus on your studies."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MARKETING_SERVICES.map((service) => (
          <div key={service.slug} className="card-premium flex flex-col p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MarketingIcon name={service.icon} className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {service.shortDescription}
            </p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <EligibilityCta
                source={`service-card-${service.slug}`}
                className="px-4 py-2 text-sm"
              />
              <Link
                href={`/services/${service.slug}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Details
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

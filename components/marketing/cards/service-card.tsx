import Link from "next/link";
import type { MarketingService } from "@/types/marketing";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import { ArrowRight } from "lucide-react";

export function ServiceCard({ service }: { service: MarketingService }) {
  return (
    <Link href={`/services/${service.slug}`} className="card-premium group block p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        <MarketingIcon name={service.icon} className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-secondary">{service.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.shortDescription}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Learn more
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

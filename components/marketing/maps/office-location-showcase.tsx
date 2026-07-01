import Link from "next/link";
import { Clock, ExternalLink, MapPin, Navigation, Phone } from "lucide-react";
import { OfficeMapCanvas } from "@/components/marketing/maps/office-map-canvas";
import { getGoogleMapsDirectionsUrl } from "@/lib/utils/google-maps-embed";
import { cn } from "@/lib/utils";
import type { MapCenter } from "@/lib/utils/google-maps-embed";

interface OfficeLocationShowcaseProps {
  center: MapCenter;
  title: string;
  address?: string;
  phone?: string;
  hours?: string;
  className?: string;
  compact?: boolean;
}

function OfficeContactDetails({
  title,
  address,
  phone,
  hours,
  directionsUrl,
  compact = false,
}: {
  title: string;
  address?: string;
  phone?: string;
  hours?: string;
  directionsUrl: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex h-full flex-col", compact ? "p-5" : "p-6 lg:p-7")}>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Visit us
          </p>
          <h3 className="text-lg font-semibold text-secondary">{title}</h3>
        </div>
      </div>

      <div className="space-y-3 text-sm text-muted-foreground">
        {address ? (
          <p className="flex items-start gap-2.5 leading-relaxed">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{address}</span>
          </p>
        ) : null}
        {hours ? (
          <p className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 shrink-0 text-primary" />
            <span>{hours}</span>
          </p>
        ) : null}
        {phone ? (
          <p className="flex items-center gap-2.5">
            <Phone className="h-4 w-4 shrink-0 text-primary" />
            <a href={`tel:${phone}`} className="font-medium text-secondary hover:text-primary">
              {phone}
            </a>
          </p>
        ) : null}
      </div>

      <div className="mt-auto pt-6">
        <Link
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-marketing inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold sm:w-auto"
        >
          <Navigation className="h-4 w-4" />
          Get directions
          <ExternalLink className="h-3.5 w-3.5 opacity-70" />
        </Link>
      </div>
    </div>
  );
}

export function OfficeLocationShowcase({
  center,
  title,
  address,
  phone,
  hours,
  className,
  compact = false,
}: OfficeLocationShowcaseProps) {
  const directionsUrl = getGoogleMapsDirectionsUrl(address ?? title);

  if (compact) {
    return (
      <div className={cn("office-showcase overflow-hidden rounded-2xl", className)}>
        <OfficeMapCanvas center={center} title={title} compact />
        <div className="border-t border-border/70 bg-white">
          <OfficeContactDetails
            title={title}
            address={address}
            phone={phone}
            hours={hours}
            directionsUrl={directionsUrl}
            compact
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("office-showcase overflow-hidden rounded-2xl", className)}>
      <div className="grid min-h-[420px] lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        <aside className="border-b border-border/70 bg-white lg:border-b-0 lg:border-r">
          <OfficeContactDetails
            title={title}
            address={address}
            phone={phone}
            hours={hours}
            directionsUrl={directionsUrl}
          />
        </aside>
        <OfficeMapCanvas center={center} title={title} />
      </div>
    </div>
  );
}

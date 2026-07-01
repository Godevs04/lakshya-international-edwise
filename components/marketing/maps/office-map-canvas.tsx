"use client";

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerLabel,
} from "@/components/ui/map";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MapCenter } from "@/lib/utils/google-maps-embed";

interface OfficeMapCanvasProps {
  center: MapCenter;
  title?: string;
  className?: string;
  compact?: boolean;
}

export function OfficeMapCanvas({
  center,
  title = "Our office",
  className,
  compact = false,
}: OfficeMapCanvasProps) {
  const [longitude, latitude] = center;

  return (
    <div
      className={cn(
        "office-map-canvas relative h-full w-full bg-slate-100",
        compact ? "min-h-[260px]" : "min-h-[360px] lg:min-h-[420px]",
        className
      )}
    >
      <Map
        center={center}
        zoom={15}
        theme="light"
        className="h-full w-full"
        attributionControl={{ compact: true }}
      >
        <MapControls position="top-right" showZoom className="[&_button]:bg-white/95" />
        <MapMarker longitude={longitude} latitude={latitude} anchor="bottom">
          <MarkerContent className="flex flex-col items-center gap-1">
            <div className="office-map-marker-pulse" aria-hidden />
            <div className="office-map-marker">
              <MapPin className="h-4 w-4 fill-white text-white" strokeWidth={2.25} />
            </div>
            <MarkerLabel
              position="bottom"
              className="rounded-full border border-white/80 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-secondary shadow-md backdrop-blur-sm"
            >
              {title}
            </MarkerLabel>
          </MarkerContent>
        </MapMarker>
      </Map>
    </div>
  );
}

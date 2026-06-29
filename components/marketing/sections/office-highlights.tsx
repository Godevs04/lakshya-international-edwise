import { MapPin, Clock, Phone } from "lucide-react";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MARKETING_OFFICES, MARKETING_OFFICE_HOURS } from "@/lib/constants/marketing/offices";
import { getMarketingContact } from "@/lib/config/marketing";

export function OfficeHighlightsSection() {
  const contact = getMarketingContact();

  return (
    <SectionShell
      variant="tint"
      eyebrow="Visit Us"
      title="Our office"
      description="Walk in for a free consultation or connect with us online."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium space-y-4 p-6">
          {MARKETING_OFFICES.map((office) => (
            <div key={office.name}>
              <h3 className="text-lg font-semibold text-secondary">{office.name}</h3>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {office.address}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-primary" />
                  {office.hours || MARKETING_OFFICE_HOURS}
                </p>
                {(contact.phone || office.phone) && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-primary" />
                    <a href={`tel:${contact.phone}`} className="hover:text-primary">
                      {contact.phone}
                    </a>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {contact.mapsEmbed ? (
          <div className="card-premium overflow-hidden">
            <iframe
              src={contact.mapsEmbed}
              title="Office location"
              className="h-full min-h-[280px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : (
          <div className="card-premium flex min-h-[280px] items-center justify-center bg-muted/30 p-6 text-center">
            <div>
              <MapPin className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">
                Map embed available when NEXT_PUBLIC_MAPS_EMBED_URL is configured
              </p>
            </div>
          </div>
        )}
      </div>
    </SectionShell>
  );
}

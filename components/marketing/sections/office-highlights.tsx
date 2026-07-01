import { MapPin } from "lucide-react";
import { OfficeLocationShowcase } from "@/components/marketing/maps/office-location-showcase";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MARKETING_OFFICES, MARKETING_OFFICE_HOURS } from "@/lib/constants/marketing/offices";
import { getMarketingContact } from "@/lib/config/marketing";

export function OfficeHighlightsSection() {
  const contact = getMarketingContact();
  const office = MARKETING_OFFICES[0];
  const title = contact.officeName ?? office?.name ?? contact.companyName;
  const address = contact.address ?? office?.address;
  const hours = contact.officeHours ?? office?.hours ?? MARKETING_OFFICE_HOURS;
  const phone = contact.phone ?? office?.phone;

  return (
    <SectionShell
      variant="tint"
      eyebrow="Visit Us"
      title="Our office"
      description="Walk in for a free consultation or connect with us online."
    >
      {contact.mapCenter ? (
        <OfficeLocationShowcase
          center={contact.mapCenter}
          title={title}
          address={address}
          phone={phone}
          hours={hours}
        />
      ) : (
        <div className="office-showcase flex min-h-[280px] flex-col items-center justify-center rounded-2xl bg-white p-8 text-center">
          <MapPin className="h-9 w-9 text-primary" />
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Add <code className="text-xs">NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL</code> to show your
            office on an interactive map.
          </p>
        </div>
      )}
    </SectionShell>
  );
}

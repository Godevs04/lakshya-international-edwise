import { PageHeader } from "@/components/dashboard/page-header";
import { PartnerForm } from "@/components/forms/partner-form";

export default function NewPartnerPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Add Partner" description="Create a new partner company" />
      <PartnerForm mode="create" />
    </div>
  );
}

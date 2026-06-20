import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { PartnerForm } from "@/components/forms/partner-form";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { getPartnerPageAccess } from "@/lib/auth/page-access";

export default async function NewPartnerPage() {
  await requireModuleEnabled("partners");
  const access = await getPartnerPageAccess();
  if (!access.canWrite) {
    redirect("/dashboard/partners");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Add Partner" description="Create a new partner company" />
      <PartnerForm mode="create" />
    </div>
  );
}

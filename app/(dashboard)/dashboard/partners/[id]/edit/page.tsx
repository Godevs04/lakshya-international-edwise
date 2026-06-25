import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { PartnerForm } from "@/components/forms/partner-form";
import { getPartnerForEdit } from "@/lib/actions/partner.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { getPartnerPageAccess } from "@/lib/auth/page-access";
import {
  parsePartnerEditSection,
  PARTNER_EDIT_SECTIONS,
} from "@/lib/constants/partner-edit-sections";

export default async function EditPartnerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  await requireModuleEnabled("partners");
  const access = await getPartnerPageAccess();
  if (!access.canWrite) {
    redirect("/dashboard/partners");
  }

  const { id } = await params;
  const { section: sectionParam } = await searchParams;
  const focusSection = parsePartnerEditSection(sectionParam);
  const partner = await getPartnerForEdit(id);
  if (!partner) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          focusSection
            ? `Edit ${PARTNER_EDIT_SECTIONS[focusSection].label}`
            : "Edit Partner"
        }
        description={partner.companyName}
      />
      <PartnerForm
        mode="edit"
        partnerId={id}
        focusSection={focusSection}
        initialData={{
          companyName: partner.companyName,
          owner: partner.owner,
          phone: partner.phone,
          email: partner.email,
          address: partner.address,
          locationAddress: partner.location?.address,
          locationCity: partner.location?.city,
          locationState: partner.location?.state,
          actionStatus: partner.actionStatus,
          gst: partner.gst,
          commissionPercent: partner.commissionPercent,
          companyLogo: partner.companyLogo,
          status: partner.status,
          contact0Name: partner.contacts?.[0]?.name,
          contact0Phone: partner.contacts?.[0]?.phone,
          contact0Email: partner.contacts?.[0]?.email,
          contact0Role: partner.contacts?.[0]?.role,
          contact1Name: partner.contacts?.[1]?.name,
          contact1Phone: partner.contacts?.[1]?.phone,
          contact1Email: partner.contacts?.[1]?.email,
          contact1Role: partner.contacts?.[1]?.role,
          contact2Name: partner.contacts?.[2]?.name,
          contact2Phone: partner.contacts?.[2]?.phone,
          contact2Email: partner.contacts?.[2]?.email,
          contact2Role: partner.contacts?.[2]?.role,
          accountName: partner.bankDetails?.accountName,
          accountNumber: partner.bankDetails?.accountNumber,
          ifsc: partner.bankDetails?.ifsc,
          bankName: partner.bankDetails?.bankName,
        }}
      />
    </div>
  );
}

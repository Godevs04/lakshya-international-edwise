import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { PartnerForm } from "@/components/forms/partner-form";
import { getPartnerById } from "@/lib/actions/partner.actions";

export default async function EditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partner = await getPartnerById(id);
  if (!partner) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Partner" description={partner.companyName} />
      <PartnerForm
        mode="edit"
        partnerId={id}
        initialData={{
          companyName: partner.companyName,
          owner: partner.owner,
          phone: partner.phone,
          email: partner.email,
          address: partner.address,
          gst: partner.gst,
          commissionPercent: partner.commissionPercent,
          companyLogo: partner.companyLogo,
          status: partner.status,
          accountName: partner.bankDetails?.accountName,
          accountNumber: partner.bankDetails?.accountNumber,
          ifsc: partner.bankDetails?.ifsc,
          bankName: partner.bankDetails?.bankName,
        }}
      />
    </div>
  );
}

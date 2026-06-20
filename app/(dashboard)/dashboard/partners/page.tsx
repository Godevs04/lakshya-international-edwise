import { PageHeader } from "@/components/dashboard/page-header";
import { PartnersTable } from "@/components/tables/partners-table";
import { getPartners } from "@/lib/actions/partner.actions";

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const result = await getPartners({ page: parseInt(params.page ?? "1", 10) });

  return (
    <div className="space-y-6">
      <PageHeader title="Partners" description="Manage partner companies and commissions" />
      <PartnersTable {...result} />
    </div>
  );
}

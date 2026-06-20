import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { PartnersTable } from "@/components/tables/partners-table";
import { getPartners } from "@/lib/actions/partner.actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const result = await getPartners({ page: parseInt(params.page ?? "1", 10) });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partners"
        description="Manage partner companies and commissions"
        badge="Network"
        action={
          <Link href="/dashboard/partners/new">
            <Button><Plus className="mr-1.5 h-4 w-4" /> Add Partner</Button>
          </Link>
        }
      />
      <PartnersTable {...result} />
    </div>
  );
}

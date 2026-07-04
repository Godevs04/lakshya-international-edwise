import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { SiteLeadsTabs } from "@/components/dashboard/site-leads-tabs";
import { SiteStudentLeadsTable } from "@/components/tables/site-student-leads-table";
import { SitePartnerLeadsTable } from "@/components/tables/site-partner-leads-table";
import {
  getSiteLeadCounts,
  getSitePartnerLeads,
  getSiteStudentLeads,
} from "@/lib/actions/site-lead.actions";
import { getAssignableUsers } from "@/lib/actions/student.actions";
import { getPartnersList } from "@/lib/actions/partner.actions";
import { getSiteLeadsPageAccess } from "@/lib/auth/page-access";
import { auth } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import type { SiteLeadsTab } from "@/lib/constants/site-leads";
import { Skeleton } from "@/components/ui/skeleton";

function resolveTab(
  requested: string | undefined,
  canViewStudents: boolean,
  canViewPartners: boolean
): SiteLeadsTab {
  if (requested === "partners" && canViewPartners) return "partners";
  if (requested === "students" && canViewStudents) return "students";
  if (canViewStudents) return "students";
  return "partners";
}

export default async function SiteLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  const user = session?.user;
  const canViewStudents = hasPermission(user, PERMISSIONS.ADMISSIONS_READ);
  const canViewPartners = hasPermission(user, PERMISSIONS.PARTNERS_READ);

  if (!canViewStudents && !canViewPartners) {
    redirect("/dashboard/overview");
  }

  const params = await searchParams;
  const access = await getSiteLeadsPageAccess();
  const tab = resolveTab(params.tab, canViewStudents, canViewPartners);
  const page = parseInt(params.page ?? "1", 10);

  const [counts, studentResult, partnerResult, assignableUsers, partners] = await Promise.all([
    getSiteLeadCounts(),
    tab === "students" && canViewStudents
      ? getSiteStudentLeads({ page, search: params.search })
      : Promise.resolve(null),
    tab === "partners" && canViewPartners
      ? getSitePartnerLeads({ page, search: params.search })
      : Promise.resolve(null),
    canViewStudents && access.canWriteStudents ? getAssignableUsers() : Promise.resolve([]),
    canViewStudents && access.canWriteStudents ? getPartnersList() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="From Site"
        description="Review website student and partner enquiries before promoting them to the CRM"
        badge={
          counts.total > 0
            ? `${counts.total} awaiting review`
            : "Site leads"
        }
      />

      <Suspense fallback={<Skeleton className="h-12 w-full rounded-2xl" />}>
        <SiteLeadsTabs
          activeTab={tab}
          studentCount={counts.students}
          partnerCount={counts.partners}
          canViewStudents={canViewStudents}
          canViewPartners={canViewPartners}
        />
      </Suspense>

      {tab === "students" && canViewStudents && studentResult ? (
        <SiteStudentLeadsTable
          {...studentResult}
          canWrite={access.canWriteStudents}
          search={params.search}
          partners={partners.map((partner) => ({
            _id: partner._id.toString(),
            companyName: partner.companyName,
          }))}
          assignableUsers={assignableUsers.map((entry) => ({
            _id: entry._id,
            name: entry.name,
          }))}
        />
      ) : null}

      {tab === "partners" && canViewPartners && partnerResult ? (
        <SitePartnerLeadsTable
          {...partnerResult}
          canWrite={access.canWritePartners}
          search={params.search}
        />
      ) : null}
    </div>
  );
}

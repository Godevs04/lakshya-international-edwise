import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdmissionDetailView } from "@/components/dashboard/admission-detail";
import { getAdmissionById } from "@/lib/actions/admission.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { getAdmissionsPageAccess, requirePagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function AdmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireModuleEnabled("students");
  await requirePagePermission(PERMISSIONS.ADMISSIONS_READ);

  const { id } = await params;
  const access = await getAdmissionsPageAccess();
  const admission = await getAdmissionById(id);
  if (!admission) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission Details"
        description={admission.studentId}
        action={
          <Link href="/dashboard/admissions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to list
            </Button>
          </Link>
        }
      />
      <AdmissionDetailView
        admission={admission}
        canWrite={access.canWrite}
        canViewRevenue={access.canViewRevenue}
      />
    </div>
  );
}

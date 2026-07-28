import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { SupportInboxClient } from "@/components/dashboard/support/support-inbox-client";
import { requirePagePermission } from "@/lib/auth/page-access";
import { auth } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";

export default async function SupportPage() {
  await requirePagePermission(PERMISSIONS.SUPPORT_READ);
  const session = await auth();
  const canAssign = hasPermission(session?.user, PERMISSIONS.SUPPORT_ASSIGN);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support"
        description="Website chat inbox — waiting queue, assigned conversations, and resolved chats."
      />
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading inbox…</div>}>
        <SupportInboxClient canAssign={canAssign} />
      </Suspense>
    </div>
  );
}

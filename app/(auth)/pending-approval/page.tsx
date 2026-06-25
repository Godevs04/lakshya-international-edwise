import Link from "next/link";
import { GlassCard } from "@/components/cards/glass-card";
import { Button } from "@/components/ui/button";
import { Clock, Mail } from "lucide-react";

export default function PendingApprovalPage() {
  return (
    <GlassCard className="p-8 text-center shadow-2xl shadow-[#E8952E]/10">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#F59E0B] to-[#EF4444] shadow-lg">
        <Clock className="h-8 w-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">You&apos;re in the queue</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
        Your email has been verified. Your account is now waiting for admin approval.
        Once an administrator or super admin reviews and approves your request with the
        correct role, you will be onboarded to the CRM.
      </p>
      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-[#E8952E]/15 bg-[#E8952E]/5 p-4 text-left text-sm">
        <p className="font-semibold text-[#E8952E]">What happens next?</p>
        <ul className="mt-2 space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <Mail className="mt-0.5 h-4 w-4 shrink-0" />
            You&apos;ll receive an email once your account is approved
          </li>
          <li className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            Until then, please wait — you cannot access the dashboard yet
          </li>
        </ul>
      </div>
      <Link href="/login" className="mt-8 inline-block">
        <Button variant="outline">Back to sign in</Button>
      </Link>
    </GlassCard>
  );
}

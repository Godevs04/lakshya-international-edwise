import Link from "next/link";
import { GlassCard } from "@/components/cards/glass-card";
import { Button } from "@/components/ui/button";
import { Clock, Mail } from "lucide-react";

export default function PendingApprovalPage() {
  return (
    <GlassCard className="border-primary/10 p-8 text-center shadow-2xl shadow-primary/15 ring-1 ring-primary/10">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0B8FD8] to-[#0369A1] shadow-lg shadow-primary/25">
        <Clock className="h-8 w-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-secondary">You&apos;re in the queue</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
        Your email has been verified. Your account is now waiting for admin approval. Once an
        administrator or super admin reviews and approves your request with the correct role, you
        will be onboarded to the CRM.
      </p>
      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-primary/15 bg-primary/5 p-4 text-left text-sm">
        <p className="font-semibold text-primary">What happens next?</p>
        <ul className="mt-2 space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            You&apos;ll receive an email once your account is approved
          </li>
          <li className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
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

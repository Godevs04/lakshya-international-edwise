import Link from "next/link";
import { GlassCard } from "@/components/cards/glass-card";
import { Button } from "@/components/ui/button";
import { verifyEmailAction } from "@/lib/actions/auth.actions";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-muted-foreground">Invalid verification link.</p>
        <Link href="/verify-otp" className="mt-4 inline-block">
          <Button variant="outline">Verify with OTP instead</Button>
        </Link>
      </GlassCard>
    );
  }

  const result = await verifyEmailAction(token);

  return (
    <GlassCard className="p-8 text-center">
      {result.success ? (
        <>
          <h2 className="text-xl font-semibold text-emerald-600">Email Verified!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your email is verified. Your account is now in the admin approval queue.
            Once an administrator approves you with the correct role, you will be onboarded to the CRM.
          </p>
          <Link href="/pending-approval" className="mt-4 inline-block">
            <Button>View queue status</Button>
          </Link>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-destructive">Verification Failed</h2>
          <p className="mt-2 text-sm text-muted-foreground">{result.error}</p>
          <Link href="/verify-otp" className="mt-4 inline-block">
            <Button variant="outline">Try OTP verification</Button>
          </Link>
        </>
      )}
    </GlassCard>
  );
}

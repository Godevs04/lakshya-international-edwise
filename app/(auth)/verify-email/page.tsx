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
            Your email has been verified successfully.
          </p>
          <Link href="/login" className="mt-4 inline-block">
            <Button>Sign in</Button>
          </Link>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-destructive">Verification Failed</h2>
          <p className="mt-2 text-sm text-muted-foreground">{result.error}</p>
          <Link href="/login" className="mt-4 inline-block">
            <Button variant="outline">Back to sign in</Button>
          </Link>
        </>
      )}
    </GlassCard>
  );
}

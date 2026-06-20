"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/cards/glass-card";
import { verifyOtpAction, resendOtpAction } from "@/lib/actions/auth.actions";
import { ShieldCheck } from "lucide-react";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const otp = formData.get("otp") as string;

    const result = await verifyOtpAction(email, otp);
    if (result.success) {
      toast.success("Email verified successfully!");
      router.push("/pending-approval");
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }

  async function handleResend() {
    const emailInput = document.getElementById("email") as HTMLInputElement | null;
    const email = emailInput?.value;
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    setResending(true);
    const result = await resendOtpAction(email);
    if (result.success) {
      toast.success("A new OTP has been sent to your email");
    } else {
      toast.error(result.error);
    }
    setResending(false);
  }

  return (
    <GlassCard className="p-8 shadow-2xl shadow-[#6D5EF7]/10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D5EF7] to-[#8B5CF6]">
          <ShieldCheck className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Verify your email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the 6-digit code sent to your email from our system
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={emailParam}
            placeholder="you@company.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="otp">Verification code</Label>
          <Input
            id="otp"
            name="otp"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="123456"
            className="text-center text-lg tracking-[0.5em]"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifying..." : "Verify email"}
        </Button>
      </form>
      <div className="mt-4 flex flex-col gap-2 text-center text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-[#6D5EF7] hover:underline disabled:opacity-50"
        >
          {resending ? "Sending..." : "Resend OTP"}
        </button>
        <Link href="/login" className="text-muted-foreground hover:underline">
          Back to sign in
        </Link>
      </div>
    </GlassCard>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<GlassCard className="p-8 text-center">Loading...</GlassCard>}>
      <VerifyOtpForm />
    </Suspense>
  );
}

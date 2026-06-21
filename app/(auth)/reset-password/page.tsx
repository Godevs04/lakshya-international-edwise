"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/cards/glass-card";
import { resetPasswordAction } from "@/lib/actions/auth.actions";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("token", token);
    const result = await resetPasswordAction(formData);
    if (result.success) {
      notify.success("Password reset successfully!");
      router.push("/login");
    } else {
      notify.error(result.error ?? "Failed to reset password");
    }
    setLoading(false);
  }

  if (!token) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-muted-foreground">Invalid reset link.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-primary hover:underline">
          Request a new link
        </Link>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8 shadow-2xl shadow-[#6D5EF7]/10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Reset password</h2>
        <p className="mt-1 text-sm text-muted-foreground">Enter your new password</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </GlassCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<GlassCard className="p-8"><p>Loading...</p></GlassCard>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

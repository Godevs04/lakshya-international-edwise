"use client";

import { useState } from "react";
import Link from "next/link";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/cards/glass-card";
import { forgotPasswordAction } from "@/lib/actions/auth.actions";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await forgotPasswordAction(formData);
    if (result.success) {
      setSent(true);
      notify.success("If the email exists, a reset link has been sent.");
    } else {
      notify.error(result.error ?? "Failed to send reset email");
    }
    setLoading(false);
  }

  return (
    <GlassCard className="p-8 shadow-2xl shadow-[#E8952E]/10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Forgot password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email to receive a reset link
        </p>
      </div>
      {sent ? (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Check your email for the password reset link.
          </p>
          <Link href="/login">
            <Button variant="outline">Back to sign in</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@company.com" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}
    </GlassCard>
  );
}

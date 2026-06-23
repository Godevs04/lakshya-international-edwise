"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/cards/glass-card";
import { APP_TAGLINE } from "@/lib/brand/app-logo";
import { registerAction } from "@/lib/actions/auth.actions";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const result = await registerAction(formData);
    if (result.success) {
      notify.success("Check your email for a 6-digit verification code");
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } else {
      notify.error(result.error ?? "Registration failed");
    }
    setLoading(false);
  }

  return (
    <GlassCard className="p-8 shadow-2xl shadow-[#6D5EF7]/10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Request access</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Register to join the approval queue. An admin will onboard you after verification.
        </p>
        <p className="mt-1 text-xs text-muted-foreground/80">{APP_TAGLINE}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" placeholder="John Doe" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@company.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">Sign in</Link>
      </p>
    </GlassCard>
  );
}

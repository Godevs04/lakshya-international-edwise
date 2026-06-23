"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GlassCard } from "@/components/cards/glass-card";
import { APP_TAGLINE } from "@/lib/brand/app-logo";
import { getLoginFailureReasonAction } from "@/lib/actions/auth.actions";

interface LoginFormProps {
  allowRegistration?: boolean;
}

export function LoginForm({ allowRegistration = false }: LoginFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        rememberMe: formData.get("rememberMe") ? "true" : "false",
        redirect: false,
      });

      if (result?.error) {
        const reason = await getLoginFailureReasonAction(email);
        if (reason.code === "UNVERIFIED") {
          notify.error(reason.error ?? "Please verify your email to continue.");
          router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
          return;
        }
        if (reason.code === "PENDING") {
          notify.info(reason.error ?? "Your account is pending approval.");
          router.push("/pending-approval");
          return;
        }
        notify.error(reason.error ?? "Invalid email or password");
        return;
      }

      notify.success("Welcome back", {
        description: "Signed in to your workspace.",
      });
      router.push("/dashboard/overview");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className="p-8 shadow-2xl shadow-[#6D5EF7]/10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to your enterprise dashboard
        </p>
        <p className="mt-1 text-xs text-muted-foreground/80">{APP_TAGLINE}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@company.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" required />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox id="rememberMe" name="rememberMe" />
            <Label htmlFor="rememberMe" className="text-sm font-normal">
              Remember me
            </Label>
          </div>
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      {allowRegistration && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Request access
          </Link>
        </p>
      )}
    </GlassCard>
  );
}

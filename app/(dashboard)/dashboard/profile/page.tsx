"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { GlassCard } from "@/components/cards/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/format";
import { updateProfileAction } from "@/lib/actions/settings.actions";
import { ROLE_LABELS } from "@/lib/constants/permissions";
import type { UserRole } from "@/types";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateProfileAction(formData);
    if (result.success) {
      toast.success("Profile updated");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your account settings" badge="Account" />
      <GlassCard className="p-8">
        <div className="mb-8 flex items-center gap-5">
          <Avatar className="h-20 w-20 ring-4 ring-[#6D5EF7]/20">
            <AvatarImage src={session?.user?.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-[#6D5EF7] to-[#8B5CF6] text-xl font-bold text-white">
              {getInitials(session?.user?.name ?? "U")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{session?.user?.name}</h2>
            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            <span className="mt-1 inline-flex rounded-full bg-[#6D5EF7]/10 px-3 py-0.5 text-xs font-semibold text-[#6D5EF7]">
              {ROLE_LABELS[(session?.user?.role ?? "staff") as UserRole]}
            </span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" defaultValue={session?.user?.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={session?.user?.email} required />
          </div>
          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-semibold">Change Password</h3>
            <div className="space-y-3">
              <Input name="currentPassword" type="password" placeholder="Current password" />
              <Input name="newPassword" type="password" placeholder="New password" />
              <Input name="confirmPassword" type="password" placeholder="Confirm new password" />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}

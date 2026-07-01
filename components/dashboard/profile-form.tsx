"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
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

interface ProfileFormProps {
  profile: {
    name: string;
    email: string;
    avatar?: string;
    role: UserRole;
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { update: updateSession } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateProfileAction(formData);
    if (result.success) {
      const nextName = result.data?.name ?? name;
      const nextEmail = result.data?.email ?? email;
      setName(nextName);
      setEmail(nextEmail);
      await updateSession({ user: { name: nextName, email: nextEmail } });
      notify.success("Profile updated");
      router.refresh();
    } else {
      notify.error(result.error ?? "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your account settings" badge="Account" />
      <GlassCard className="p-8">
        <div className="mb-8 flex items-center gap-5">
          <Avatar className="h-20 w-20 ring-4 ring-[#E8952E]/20">
            <AvatarImage src={profile.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-[#E8952E] to-[#F59E0B] text-xl font-bold text-white">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{name}</h2>
            <p className="text-sm text-muted-foreground">{email}</p>
            <span className="mt-1 inline-flex rounded-full bg-[#E8952E]/10 px-3 py-0.5 text-xs font-semibold text-[#E8952E]">
              {ROLE_LABELS[profile.role]}
            </span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
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

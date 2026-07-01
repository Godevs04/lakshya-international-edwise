import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { getCurrentUserProfile } from "@/lib/actions/settings.actions";

export default async function ProfilePage() {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    redirect("/login");
  }

  return <ProfileForm key={`${profile.id}-${profile.name}-${profile.email}`} profile={profile} />;
}

import { auth } from "@/lib/auth/auth";
import { getDefaultDashboardHref } from "@/lib/constants/menu-permissions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  redirect(getDefaultDashboardHref(session?.user?.permissions ?? []));
}

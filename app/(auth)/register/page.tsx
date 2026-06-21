import { redirect } from "next/navigation";
import { isPublicRegistrationAllowed } from "@/lib/config/env";
import { RegisterForm } from "@/components/auth/register-form";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  if (!isPublicRegistrationAllowed()) {
    redirect("/login");
  }

  return <RegisterForm />;
}

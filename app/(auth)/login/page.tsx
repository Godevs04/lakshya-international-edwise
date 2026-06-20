import { LoginForm } from "@/components/auth/login-form";
import { isPublicRegistrationAllowed } from "@/lib/config/env";

export default function LoginPage() {
  return <LoginForm allowRegistration={isPublicRegistrationAllowed()} />;
}

import { cache } from "react";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth/auth.config";
import { authorizeCredentials } from "@/lib/auth/authorize";

const { handlers, auth: nextAuth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" },
      },
      authorize: authorizeCredentials,
    }),
  ],
});

export { handlers, signIn, signOut };

export const auth = cache(nextAuth);

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

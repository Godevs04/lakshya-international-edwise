import type { NextAuthConfig } from "next-auth";
import { getAuthSecret, resolveAuthUrl } from "@/lib/config/env";
import { isPublicRegistrationAllowed } from "@/lib/config/env";
import { getSessionMaxAgeSeconds } from "@/lib/auth/session-expiry";
import type { UserRole } from "@/types";

const authUrl = resolveAuthUrl();
process.env.AUTH_URL = authUrl;
process.env.NEXTAUTH_URL = authUrl;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      permissions: string[];
      avatar?: string;
    };
  }

  interface User {
    role: UserRole;
    permissions: string[];
    avatar?: string;
    rememberMe?: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    permissions: string[];
    avatar?: string;
    rememberMe?: boolean;
  }
}

export const authConfig = {
  secret: getAuthSecret(),
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  providers: [],
  callbacks: {
    async redirect({ url, baseUrl }) {
      const canonicalBase = authUrl || baseUrl;

      if (url.startsWith("/")) {
        return `${canonicalBase}${url}`;
      }

      try {
        const target = new URL(url);
        const allowed = new URL(canonicalBase);
        if (target.origin === allowed.origin) {
          return url;
        }
      } catch {
        // Fall through to login redirect.
      }

      return `${canonicalBase}/login`;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = user.role;
        token.permissions = user.permissions;
        token.avatar = user.avatar;
        token.rememberMe = user.rememberMe ?? false;
        const maxAge = await getSessionMaxAgeSeconds(!!token.rememberMe);
        token.exp = Math.floor(Date.now() / 1000) + maxAge;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.permissions = token.permissions as string[];
        session.user.avatar = token.avatar as string | undefined;
      }
      return session;
    },
    authorized({ auth: session, request }) {
      const { pathname } = request.nextUrl;
      const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password") ||
        pathname.startsWith("/verify-email") ||
        pathname.startsWith("/verify-otp") ||
        pathname.startsWith("/pending-approval");

      if (pathname.startsWith("/register") && !isPublicRegistrationAllowed()) {
        return Response.redirect(new URL("/login", request.nextUrl));
      }

      if (isAuthPage) {
        if (session) {
          return Response.redirect(new URL("/dashboard/overview", request.nextUrl));
        }
        return true;
      }
      if (pathname.startsWith("/dashboard")) return !!session;
      return true;
    },
  },
} satisfies NextAuthConfig;

import type { NextAuthConfig } from "next-auth";
import { getAuthSecret, getConfiguredAuthUrl } from "@/lib/config/env";
import { isPublicRegistrationAllowed } from "@/lib/config/env";
import { getSessionMaxAgeSeconds } from "@/lib/auth/session-expiry";
import type { UserRole } from "@/types";

const configuredAuthUrl = getConfiguredAuthUrl();
if (configuredAuthUrl) {
  process.env.AUTH_URL = configuredAuthUrl;
  process.env.NEXTAUTH_URL = configuredAuthUrl;
}

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
      const requestBase = baseUrl.replace(/\/$/, "");
      const canonicalBase = configuredAuthUrl ?? requestBase;

      if (url.startsWith("/")) {
        return `${requestBase}${url}`;
      }

      try {
        const target = new URL(url);
        const allowedOrigins = new Set(
          [requestBase, configuredAuthUrl]
            .filter((value): value is string => Boolean(value))
            .map((value) => new URL(value).origin)
        );
        if (allowedOrigins.has(target.origin)) {
          return url;
        }
      } catch {
        // Fall through to login redirect.
      }

      return `${canonicalBase}/login`;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = user.role;
        token.permissions = user.permissions;
        token.avatar = user.avatar;
        token.rememberMe = user.rememberMe ?? false;
        const maxAge = await getSessionMaxAgeSeconds(!!token.rememberMe);
        token.exp = Math.floor(Date.now() / 1000) + maxAge;
      }
      if (trigger === "update" && session?.user) {
        if (session.user.name) token.name = session.user.name;
        if (session.user.email) token.email = session.user.email;
        if (session.user.avatar !== undefined) token.avatar = session.user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
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

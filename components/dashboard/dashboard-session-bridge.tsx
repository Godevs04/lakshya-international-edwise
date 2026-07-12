"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { PostHogIdentifyBridge } from "@/components/analytics/posthog-identify-bridge";

export function DashboardSessionBridge({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider session={session}>
      <PostHogIdentifyBridge />
      {children}
    </SessionProvider>
  );
}

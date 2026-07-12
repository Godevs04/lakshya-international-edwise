"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";

export function PostHogIdentifyBridge() {
  const { data: session, status } = useSession();
  const identifiedRef = useRef<string | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim();
    if (!token || status !== "authenticated") return;

    const user = session?.user;
    if (!user?.email) return;

    const distinctId = user.email;
    if (identifiedRef.current === distinctId) return;

    posthog.identify(distinctId, {
      email: user.email,
      name: user.name,
      role: user.role,
      user_id: user.id,
    });
    identifiedRef.current = distinctId;
  }, [session, status]);

  return null;
}

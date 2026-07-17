import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { fontMarketing } from "@/lib/fonts";
import { NotFoundView } from "@/components/marketing/sections/not-found-view";
import { EligibilityModalProvider } from "@/components/marketing/eligibility/eligibility-modal-provider";
import "@/app/(marketing)/marketing.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className={cn("marketing-site min-h-screen", fontMarketing.variable)}>
      <EligibilityModalProvider>
        <main className="marketing-premium flex min-h-screen items-center justify-center px-4 py-16">
          <NotFoundView />
        </main>
      </EligibilityModalProvider>
    </div>
  );
}

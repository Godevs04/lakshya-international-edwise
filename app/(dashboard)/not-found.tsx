import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { fontMarketing } from "@/lib/fonts";
import { NotFoundView } from "@/components/marketing/sections/not-found-view";
import "@/app/(marketing)/marketing.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function DashboardNotFound() {
  return (
    <div className={cn("marketing-site", fontMarketing.variable)}>
      <div className="marketing-premium flex min-h-[60vh] items-center justify-center px-4 py-10">
        <NotFoundView
          showEligibilityCta={false}
          primaryHref="/dashboard/overview"
          primaryLabel="Back to dashboard"
        />
      </div>
    </div>
  );
}

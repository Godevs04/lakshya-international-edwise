import { cn } from "@/lib/utils";

/** Profiles that should look “done / parked” in student lists. */
export type ClosedStudentProfileTone = "completed" | "closed" | "rejected";

export function getClosedStudentProfileTone(
  status?: string | null
): ClosedStudentProfileTone | null {
  if (status === "completed") return "completed";
  if (status === "rejected") return "rejected";
  if (status === "closed") return "closed";
  return null;
}

/** Soft wash + accent rail so closed files read at a glance without shouting. */
export function closedStudentProfileRowClass(tone: ClosedStudentProfileTone | null): string {
  switch (tone) {
    case "completed":
      return cn(
        "relative bg-gradient-to-r from-[#0D9488]/12 via-[#0D9488]/[0.04] to-transparent",
        "shadow-[inset_3px_0_0_0_#0D9488]",
        "hover:from-[#0D9488]/16 hover:via-[#0D9488]/[0.06] hover:to-transparent"
      );
    case "closed":
      return cn(
        "relative bg-gradient-to-r from-slate-500/10 via-slate-500/[0.03] to-transparent",
        "shadow-[inset_3px_0_0_0_#94A3B8] opacity-90",
        "hover:from-slate-500/14 hover:via-slate-500/[0.05] hover:to-transparent"
      );
    case "rejected":
      return cn(
        "relative bg-gradient-to-r from-[#EF4444]/10 via-[#EF4444]/[0.03] to-transparent",
        "shadow-[inset_3px_0_0_0_#EF4444] opacity-90",
        "hover:from-[#EF4444]/14 hover:via-[#EF4444]/[0.05] hover:to-transparent"
      );
    default:
      return "";
  }
}

export function closedStudentProfileCardClass(tone: ClosedStudentProfileTone | null): string {
  switch (tone) {
    case "completed":
      return cn(
        "border-[#0D9488]/25 bg-gradient-to-br from-[#0D9488]/10 via-card to-card",
        "ring-1 ring-[#0D9488]/15 shadow-[0_8px_24px_-16px_rgba(13,148,136,0.55)]"
      );
    case "closed":
      return "border-slate-400/25 bg-gradient-to-br from-slate-500/8 via-card to-card opacity-90";
    case "rejected":
      return "border-[#EF4444]/25 bg-gradient-to-br from-[#EF4444]/8 via-card to-card";
    default:
      return "";
  }
}

export const COMPLETED_STATUS_BADGE_CLASS =
  "border-[#0D9488]/35 bg-[#0D9488]/15 text-[#0F766E] shadow-[0_0_0_1px_rgba(13,148,136,0.08)] dark:text-[#5EEAD4]";

export const COMPLETED_STATUS_DOT_CLASS = "bg-[#0D9488] shadow-[0_0_6px_rgba(13,148,136,0.55)]";

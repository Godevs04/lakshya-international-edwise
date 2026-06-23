import { cn } from "@/lib/utils";
import { getStudentContactLinks } from "@/lib/utils/student-contact";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, MessageSquare, Phone } from "lucide-react";

interface StudentContactActionsProps {
  phone?: string;
  whatsapp?: string;
  email?: string;
  studentName?: string;
  variant?: "icons" | "buttons";
  channels?: "all" | "whatsapp";
  className?: string;
  showPhoneLabel?: boolean;
}

const iconLinkClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#6D5EF7]/10 bg-white/60 transition-colors hover:bg-[#6D5EF7]/8 dark:bg-white/5";

export function StudentContactActions({
  phone,
  whatsapp,
  email,
  studentName,
  variant = "icons",
  channels = "all",
  className,
  showPhoneLabel = false,
}: StudentContactActionsProps) {
  const links = getStudentContactLinks({ phone, whatsapp, email, studentName });
  const whatsappOnly = channels === "whatsapp";
  const displayPhone = phone ?? whatsapp ?? null;
  const hasActions = whatsappOnly
    ? Boolean(links.whatsappUrl || (showPhoneLabel && displayPhone))
    : links.callUrl || links.smsUrl || links.whatsappUrl || links.mailUrl;

  if (!hasActions) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (whatsappOnly && variant === "icons") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {showPhoneLabel && <span>{displayPhone ?? "—"}</span>}
        {links.whatsappUrl && (
          <a
            href={links.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(iconLinkClass, "text-emerald-600 hover:text-emerald-700")}
            aria-label={studentName ? `WhatsApp ${studentName}` : "WhatsApp student"}
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        )}
      </div>
    );
  }

  if (variant === "buttons") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {!whatsappOnly && links.callUrl && (
          <a href={links.callUrl}>
            <Button
              variant="outline"
              size="sm"
              className="border-blue-500/30 text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
            >
              <Phone className="mr-1 h-4 w-4" />
              Call
            </Button>
          </a>
        )}
        {!whatsappOnly && links.smsUrl && (
          <a href={links.smsUrl}>
            <Button
              variant="outline"
              size="sm"
              className="border-violet-500/30 text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/30"
            >
              <MessageSquare className="mr-1 h-4 w-4" />
              SMS
            </Button>
          </a>
        )}
        {links.whatsappUrl && (
          <a href={links.whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-500/30 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            >
              <MessageCircle className="mr-1 h-4 w-4" />
              WhatsApp
            </Button>
          </a>
        )}
        {!whatsappOnly && links.mailUrl && (
          <a href={links.mailUrl}>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-500/30 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
            >
              <Mail className="mr-1 h-4 w-4" />
              Email
            </Button>
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {showPhoneLabel && <span>{phone ?? whatsapp ?? "—"}</span>}
      <div className="flex items-center gap-1">
        {!whatsappOnly && links.callUrl && (
          <a
            href={links.callUrl}
            className={cn(iconLinkClass, "text-blue-600 hover:text-blue-700")}
            aria-label={studentName ? `Call ${studentName}` : "Call student"}
          >
            <Phone className="h-4 w-4" />
          </a>
        )}
        {!whatsappOnly && links.smsUrl && (
          <a
            href={links.smsUrl}
            className={cn(iconLinkClass, "text-violet-600 hover:text-violet-700")}
            aria-label={studentName ? `SMS ${studentName}` : "SMS student"}
          >
            <MessageSquare className="h-4 w-4" />
          </a>
        )}
        {links.whatsappUrl && (
          <a
            href={links.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(iconLinkClass, "text-emerald-600 hover:text-emerald-700")}
            aria-label={studentName ? `WhatsApp ${studentName}` : "WhatsApp student"}
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        )}
        {!whatsappOnly && links.mailUrl && (
          <a
            href={links.mailUrl}
            className={cn(iconLinkClass, "text-amber-600 hover:text-amber-700")}
            aria-label={studentName ? `Email ${studentName}` : "Email student"}
          >
            <Mail className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}

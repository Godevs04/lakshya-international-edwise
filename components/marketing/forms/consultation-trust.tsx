import { Star, Shield, Clock } from "lucide-react";
import { MARKETING_TRUST } from "@/lib/constants/marketing/trust";

export function ConsultationTrust() {
  return (
    <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-emerald-600" />
          No spam
        </span>
        <span className="text-border">|</span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-emerald-600" />
          Response within {MARKETING_TRUST.responseTimeMinutes} minutes
        </span>
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <span className="text-xs font-medium text-secondary">
          {MARKETING_TRUST.rating} rating
        </span>
        <span className="text-xs text-muted-foreground">
          Trusted by {MARKETING_TRUST.studentCount.toLocaleString("en-IN")}+ students
        </span>
      </div>
    </div>
  );
}

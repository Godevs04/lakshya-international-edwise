import { Star } from "lucide-react";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MARKETING_GOOGLE_REVIEWS } from "@/lib/constants/marketing/google-reviews";
import { MARKETING_TRUST } from "@/lib/constants/marketing/trust";

export function GoogleReviewsSection() {
  return (
    <SectionShell
      variant="white"
      eyebrow="Reviews"
      title="What families say about us"
      description="Real feedback from students and parents who trusted us with their study abroad journey."
      align="center"
    >
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-4xl font-bold text-secondary">{MARKETING_TRUST.rating}</span>
          <div>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {MARKETING_TRUST.reviewCount.toLocaleString("en-IN")}+ reviews
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Google Reviews integration placeholder - connect your Google Business profile
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {MARKETING_GOOGLE_REVIEWS.map((review) => (
          <div key={review.author} className="card-premium p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold text-secondary">{review.author}</p>
              <div className="flex">
                {Array.from({ length: review.rating }).map((_, index) => (
                  <Star key={index} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">&quot;{review.text}&quot;</p>
            <p className="mt-3 text-xs text-muted-foreground">{review.date}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

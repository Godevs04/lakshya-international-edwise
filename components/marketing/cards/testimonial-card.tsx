import Image from "next/image";
import type { MarketingTestimonial } from "@/types/marketing";
import { Star, BadgeCheck, Play } from "lucide-react";

export function TestimonialCard({ testimonial }: { testimonial: MarketingTestimonial }) {
  return (
    <blockquote className="card-premium flex h-full flex-col p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {testimonial.photo ? (
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-primary/20">
              <Image
                src={testimonial.photo}
                alt={testimonial.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {testimonial.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold text-secondary">{testimonial.name}</p>
            <p className="text-xs text-muted-foreground">
              {testimonial.role}
              {testimonial.destinationFlag ? ` | ${testimonial.destinationFlag}` : ""}
            </p>
          </div>
        </div>
        <div className="flex shrink-0">
          {Array.from({ length: testimonial.rating }).map((_, index) => (
            <Star key={index} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>

      <p className="flex-1 text-sm leading-relaxed text-secondary/90">
        &quot;{testimonial.quote}&quot;
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {testimonial.university && (
          <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-secondary/70">
            {testimonial.university}
          </span>
        )}
        {testimonial.visaStatus && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
            <BadgeCheck className="h-3 w-3" />
            {testimonial.visaStatus}
          </span>
        )}
      </div>

      <button
        type="button"
        disabled={!testimonial.videoUrl}
        className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={testimonial.videoUrl ? "Watch video testimonial" : "Video testimonial coming soon"}
      >
        <Play className="h-3.5 w-3.5" />
        {testimonial.videoUrl ? "Watch video" : "Video coming soon"}
      </button>
    </blockquote>
  );
}

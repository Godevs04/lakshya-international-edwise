import Image from "next/image";
import type { MarketingTestimonial } from "@/types/marketing";
import { Star, BadgeCheck, Play, Wallet, Calendar } from "lucide-react";

export function TestimonialCard({ testimonial }: { testimonial: MarketingTestimonial }) {
  return (
    <blockquote className="card-premium testimonial-card-premium group flex h-full flex-col overflow-hidden p-0">
      <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-primary/10 via-accent/40 to-sky-100/60">
        {testimonial.photo ? (
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-lg">
            <Image
              src={testimonial.photo}
              alt={testimonial.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-primary/10 text-xl font-bold text-primary shadow-lg">
            {testimonial.name.charAt(0)}
          </div>
        )}
        <button
          type="button"
          disabled={!testimonial.videoUrl}
          className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10 disabled:cursor-default"
          aria-label={testimonial.videoUrl ? "Watch video testimonial" : "Video testimonial coming soon"}
        >
          <span className="flex h-12 w-12 scale-90 items-center justify-center rounded-full bg-white/90 text-primary opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
            <Play className="ml-0.5 h-5 w-5 fill-primary" />
          </span>
        </button>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-secondary">{testimonial.name}</p>
            <p className="text-xs text-muted-foreground">
              {testimonial.role}
              {testimonial.destinationFlag ? ` · ${testimonial.destinationFlag}` : ""}
            </p>
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
          {testimonial.loanAmount && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold text-primary">
              <Wallet className="h-3 w-3" />
              {testimonial.loanAmount}
            </span>
          )}
          {testimonial.approvalDate && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {testimonial.approvalDate}
            </span>
          )}
        </div>
      </div>
    </blockquote>
  );
}

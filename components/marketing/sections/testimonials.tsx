import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MARKETING_TESTIMONIALS } from "@/lib/constants/marketing/testimonials";
import { TestimonialCard } from "@/components/marketing/cards/testimonial-card";
import Link from "next/link";

interface TestimonialsSectionProps {
  showHeading?: boolean;
}

export function TestimonialsSection({ showHeading = true }: TestimonialsSectionProps) {
  const content = (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {MARKETING_TESTIMONIALS.map((item) => (
          <TestimonialCard key={item.id} testimonial={item} />
        ))}
      </div>
      {showHeading && (
        <div className="mt-8 text-center">
          <Link href="/success-stories" className="text-sm font-semibold text-primary hover:underline">
            View all success stories
          </Link>
        </div>
      )}
    </>
  );

  if (!showHeading) {
    return (
      <section className="section-padding section-muted">
        <div className="container mx-auto max-w-6xl px-4">{content}</div>
      </section>
    );
  }

  return (
    <SectionShell
      variant="muted"
      eyebrow="Success Stories"
      title="Students trust us for their global future"
      description="Real outcomes from counselling, admissions, and loan support."
      align="center"
    >
      {content}
    </SectionShell>
  );
}

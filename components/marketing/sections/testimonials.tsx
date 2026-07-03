import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MARKETING_TESTIMONIALS } from "@/lib/constants/marketing/testimonials";
import { TestimonialCard } from "@/components/marketing/cards/testimonial-card";

interface TestimonialsSectionProps {
  showHeading?: boolean;
}

export function TestimonialsSection({ showHeading = true }: TestimonialsSectionProps) {
  const content = (
    <div className="grid gap-4 md:grid-cols-2">
      {MARKETING_TESTIMONIALS.map((item) => (
        <TestimonialCard key={item.id} testimonial={item} />
      ))}
    </div>
  );

  if (!showHeading) {
    return (
      <section id="testimonials" className="section-padding section-muted">
        <div className="container mx-auto max-w-6xl px-4">{content}</div>
      </section>
    );
  }

  return (
    <SectionShell
      id="testimonials"
      variant="muted"
      eyebrow="Student Stories"
      title="Students trust Lakshya to fund their global future"
      description="Real loan approvals for students headed to top universities worldwide."
      align="center"
    >
      {content}
    </SectionShell>
  );
}

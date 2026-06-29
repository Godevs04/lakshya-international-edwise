import { MARKETING_TESTIMONIALS } from "@/lib/constants/marketing/testimonials";
import { SectionHeading } from "@/components/marketing/sections/section-heading";
import { TestimonialCard } from "@/components/marketing/cards/marketing-cards";

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Success Stories"
          title="Students trust Lakshya for their global future"
          description="Real outcomes from counselling, admissions, and loan support."
          align="center"
          className="mb-10"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {MARKETING_TESTIMONIALS.map((item) => (
            <TestimonialCard key={item.id} testimonial={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

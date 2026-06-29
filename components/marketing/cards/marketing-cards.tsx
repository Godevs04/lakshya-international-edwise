import Link from "next/link";
import type { MarketingCountry, MarketingService, BlogPostMeta } from "@/types/marketing";
import type { MARKETING_TESTIMONIALS } from "@/lib/constants/marketing/testimonials";

export function ServiceCard({ service }: { service: MarketingService }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="glass-card block rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <h3 className="text-lg font-semibold text-secondary">{service.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.shortDescription}</p>
    </Link>
  );
}

export function CountryCard({ country }: { country: MarketingCountry }) {
  return (
    <Link
      href={`/countries/${country.slug}`}
      className="glass-card block rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="text-xs font-bold uppercase tracking-wider text-primary">{country.flag}</div>
      <h3 className="mt-2 text-lg font-semibold text-secondary">{country.name}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{country.shortDescription}</p>
    </Link>
  );
}

export function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof MARKETING_TESTIMONIALS)[number];
}) {
  return (
    <blockquote className="glass-card rounded-2xl p-5">
      <p className="text-sm leading-relaxed text-secondary/90">
        &quot;{testimonial.quote}&quot;
      </p>
      <footer className="mt-4 text-sm">
        <p className="font-semibold text-secondary">{testimonial.name}</p>
        <p className="text-muted-foreground">
          {testimonial.role} | {testimonial.country}
        </p>
      </footer>
    </blockquote>
  );
}

export function BlogCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="glass-card block rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-primary">{post.category}</p>
      <h3 className="mt-2 text-lg font-semibold text-secondary">{post.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.description}</p>
      <p className="mt-4 text-xs text-muted-foreground">
        {new Date(post.date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </Link>
  );
}

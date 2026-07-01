import Link from "next/link";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/marketing/sections/section-heading";

interface CtaBannerProps {
  title?: string;
  description?: string;
  className?: string;
}

export function CtaBanner({
  title = "Ready to start your study abroad journey?",
  description = "Book a free consultation with our counsellors and get a personalized roadmap.",
  className,
}: CtaBannerProps) {
  return (
    <section className={cn("section-padding", className)}>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="rounded-3xl bg-gradient-to-br from-secondary to-secondary/90 px-6 py-10 text-white md:px-10 md:py-12">
          <SectionHeading
            title={title}
            description={description}
            align="center"
            inverted
          />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="btn-marketing inline-flex rounded-full px-6 py-3 text-sm font-semibold"
            >
              Book Free Consultation
            </Link>
            <Link
              href="/education-loans"
              className="inline-flex rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore Education Loans
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

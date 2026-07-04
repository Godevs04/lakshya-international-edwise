import Link from "next/link";
import type { LegalSection } from "@/lib/constants/marketing/legal-content";

interface LegalDocumentProps {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalDocument({ title, lastUpdated, intro, sections }: LegalDocumentProps) {
  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-10 rounded-2xl border border-border/60 bg-accent/20 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Legal</p>
          <h1 className="heading-section mt-2 text-foreground">{title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{intro}</p>
          <p className="mt-3 text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        <nav className="mb-8 flex flex-wrap gap-2" aria-label="Table of contents">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-full border border-border/80 bg-white px-3 py-1 text-xs font-medium text-secondary transition-colors hover:border-primary/30 hover:text-primary"
            >
              {section.title}
            </a>
          ))}
        </nav>

        <div className="space-y-8">
          {sections.map((section) => (
            <article
              key={section.id}
              id={section.id}
              className="card-premium scroll-mt-24 p-6 sm:p-8"
            >
              <h2 className="text-lg font-semibold text-secondary">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Questions?{" "}
          <Link href="/contact" className="font-semibold text-primary hover:underline">
            Contact our team
          </Link>
        </p>
      </div>
    </section>
  );
}

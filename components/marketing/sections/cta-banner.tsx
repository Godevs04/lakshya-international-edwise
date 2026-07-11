import Link from "next/link";
import { cn } from "@/lib/utils";
import { MarketingContainer } from "@/components/marketing/layout/marketing-container";
import { SectionHeading } from "@/components/marketing/sections/section-heading";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { getWhatsAppLink } from "@/lib/config/marketing";
import { MessageCircle } from "lucide-react";

interface CtaBannerProps {
  title?: string;
  description?: string;
  className?: string;
  source?: string;
  targetCountry?: string;
}

export function CtaBanner({
  title = "Ready to fund your education abroad?",
  description = "Check your eligibility in under 7 minutes and get matched with the best lender for your profile.",
  className,
  source = "cta-banner",
  targetCountry,
}: CtaBannerProps) {
  const whatsapp = getWhatsAppLink(
    "Hello, I would like to check my education loan eligibility."
  );

  return (
    <section data-journey-node="cta" className={cn("section-padding section-relative", className)}>
      <MarketingContainer size="premium" className="relative">
        <div className="cta-premium relative overflow-hidden rounded-3xl px-6 py-10 md:px-10 md:py-14">
          <div
            className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-sky-300/20 blur-3xl"
            aria-hidden
          />
          <SectionHeading title={title} description={description} align="center" inverted />
          <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
            <EligibilityCta
              source={source}
              targetCountry={targetCountry}
              variant="outline"
              className="btn-shine border-white bg-white px-7 py-3.5 text-base text-primary hover:bg-white/90"
            />
            {whatsapp && (
              <Link
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </Link>
            )}
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}

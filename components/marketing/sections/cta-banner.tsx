import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/marketing/sections/section-heading";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";

interface CtaBannerProps {
  title?: string;
  description?: string;
  className?: string;
  source?: string;
}

export function CtaBanner({
  title = "Ready to fund your education abroad?",
  description = "Check your eligibility in under 7 minutes and get matched with the best lender for your profile.",
  className,
  source = "cta-banner",
}: CtaBannerProps) {
  return (
    <section className={cn("section-padding", className)}>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="rounded-3xl bg-gradient-to-br from-[#0b8fd8] to-[#097bb8] px-6 py-10 text-white md:px-10 md:py-14">
          <SectionHeading title={title} description={description} align="center" inverted />
          <div className="mt-6 flex justify-center">
            <EligibilityCta
              source={source}
              variant="outline"
              className="border-white bg-white px-7 py-3.5 text-base text-primary hover:bg-white/90"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

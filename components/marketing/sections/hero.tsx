import Link from "next/link";
import Image from "next/image";
import { LeadForm } from "@/components/marketing/forms/lead-form";
import { MarketingContainer } from "@/components/marketing/layout/marketing-container";
import { HeroBackground } from "@/components/marketing/sections/hero-background";
import { PartnerMarquee } from "@/components/marketing/sections/partner-marquee";
import { MARKETING_HERO_TAGS, MARKETING_HERO_STUDENT_PHOTOS, MARKETING_TRUST } from "@/lib/constants/marketing/trust";
import { getMarketingContact } from "@/lib/config/marketing";
import { Star, CheckCircle2 } from "lucide-react";

export function MarketingHero() {
  const contact = getMarketingContact();

  return (
    <section className="hero-gradient section-padding relative overflow-hidden pb-16 pt-12 md:pb-20 md:pt-16">
      <HeroBackground />

      <MarketingContainer className="relative z-10">
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
          <span className="trust-pill">
            Trusted by {MARKETING_TRUST.studentCount.toLocaleString("en-IN")}+ students
          </span>
          <span className="trust-pill inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {MARKETING_TRUST.rating} Google-style rating
          </span>
          <span className="trust-pill">
            {MARKETING_TRUST.visaSuccessRate}% visa success
          </span>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
              Study Abroad Experts
            </p>
            <h1 className="heading-display text-secondary">
              Study Abroad
              <br />
              <span className="text-primary">Made Simple.</span>
            </h1>
            <p className="prose-marketing mt-6 text-lg text-muted-foreground">
              {contact.companyName} guides students from counselling and admissions to visas,
              scholarships, and education loan disbursement.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {MARKETING_HERO_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-marketing rounded-full px-6 py-3 text-sm font-semibold">
                Book FREE Consultation
              </Link>
              <Link
                href="/services"
                className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-secondary transition-colors hover:bg-muted"
              >
                Explore Services
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-white/60 p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold text-primary">{MARKETING_TRUST.visaSuccessRate}%</p>
                <p className="text-xs text-muted-foreground">Visa success rate</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-white/60 p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold text-primary">320+</p>
                <p className="text-xs text-muted-foreground">University partners</p>
              </div>
              <div className="col-span-2 rounded-xl border border-border/60 bg-white/60 p-4 backdrop-blur-sm sm:col-span-1">
                <p className="flex items-center gap-1 text-2xl font-bold text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  12+
                </p>
                <p className="text-xs text-muted-foreground">Years of experience</p>
              </div>
            </div>
          </div>

          <div>
            <LeadForm variant="consultation" formPage="/" premium />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MARKETING_HERO_STUDENT_PHOTOS.map((photo, index) => (
            <div
              key={photo.src}
              className={`relative overflow-hidden rounded-2xl border border-border/60 shadow-sm ${
                index === 0 ? "col-span-2 row-span-2 aspect-[4/5] sm:col-span-1" : "aspect-square"
              }`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover"
                priority={index === 0}
                sizes={index === 0 ? "(max-width: 768px) 50vw, 200px" : "150px"}
              />
            </div>
          ))}
        </div>

        <div className="mt-10">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Partner Universities
          </p>
          <PartnerMarquee />
        </div>
      </MarketingContainer>
    </section>
  );
}

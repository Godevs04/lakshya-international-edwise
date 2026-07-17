import Image from "next/image";
import type { MarketingCountry } from "@/types/marketing";
import { getCountryFlagLabel } from "@/lib/constants/marketing/countries";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { MarketingContainer } from "@/components/marketing/layout/marketing-container";

interface CountryHeroProps {
  country: MarketingCountry;
  slug: string;
}

export function CountryHero({ country, slug }: CountryHeroProps) {
  return (
    <section className="country-hero-premium relative overflow-hidden">
      <div className="relative min-h-[300px] sm:min-h-[360px]">
        {country.image ? (
          <Image
            src={country.image}
            alt={country.imageAlt ?? `${country.name} study destination`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            quality={85}
          />
        ) : (
          <div className="absolute inset-0 hero-gradient" />
        )}

        <div className="country-hero-premium-overlay absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 via-transparent to-transparent" />

        <div className="relative z-10 flex min-h-[300px] items-center sm:min-h-[360px]">
          <MarketingContainer size="premium" className="py-14 text-center sm:py-16">
            <span className="country-hero-flag inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-base font-bold text-white backdrop-blur-md">
              {getCountryFlagLabel(country)}
            </span>
            <h1 className="hero-premium-heading mt-4 text-white">
              {country.heroTitle ?? `Education loans for ${country.name}`}
            </h1>
            <p className="prose-marketing mx-auto mt-5 max-w-2xl text-lg text-white/88">
              {country.description}
            </p>
            <div className="mt-8">
              <EligibilityCta
                source={`country-${slug}`}
                targetCountry={country.name}
                className="nav-eligibility-cta px-7 py-3.5 text-base"
              />
            </div>
          </MarketingContainer>
        </div>
      </div>
    </section>
  );
}

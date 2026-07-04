import Image from "next/image";
import type { MarketingCountry } from "@/types/marketing";
import { getCountryFlagLabel } from "@/lib/constants/marketing/countries";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";

interface CountryHeroProps {
  country: MarketingCountry;
  slug: string;
}

export function CountryHero({ country, slug }: CountryHeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[280px] sm:min-h-[340px]">
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

        <div className="absolute inset-0 bg-gradient-to-r from-secondary/92 via-secondary/78 to-secondary/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 via-transparent to-transparent" />

        <div className="relative z-10 flex min-h-[280px] items-center sm:min-h-[340px]">
          <div className="container mx-auto max-w-3xl px-4 py-14 text-center sm:py-16">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-base font-bold text-white backdrop-blur-sm">
              {getCountryFlagLabel(country)}
            </span>
            <h1 className="heading-display mt-4 text-white">
              Education loans for {country.name}
            </h1>
            <p className="prose-marketing mx-auto mt-5 max-w-2xl text-lg text-white/85">
              {country.description}
            </p>
            <div className="mt-8">
              <EligibilityCta
                source={`country-${slug}`}
                className="nav-eligibility-cta px-7 py-3.5 text-base"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { MarketingCountry } from "@/types/marketing";
import { getCountryFlagLabel } from "@/lib/constants/marketing/countries";
import { ArrowRight, Wallet, Clock, Home, Plane } from "lucide-react";

export function CountryCard({ country }: { country: MarketingCountry }) {
  const flagLabel = getCountryFlagLabel(country);

  return (
    <Link
      href={`/countries/${country.slug}`}
      className="card-premium card-premium-lift group block overflow-hidden"
    >
      <div className="relative h-36 overflow-hidden sm:h-40">
        {country.image ? (
          <Image
            src={country.image}
            alt={country.imageAlt ?? `${country.name} study destination`}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={85}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/15 via-accent/30 to-sky-400/15" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/5" />

        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-secondary shadow-sm backdrop-blur-sm">
          {flagLabel}
        </span>

        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-primary opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          <Plane className="mr-1 inline h-3 w-3" />
          India → {country.name}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-semibold text-white drop-shadow-sm">{country.name}</h3>
          {country.studentCount && (
            <p className="mt-0.5 text-xs text-white/80">{country.studentCount}</p>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <p className="text-sm leading-relaxed text-muted-foreground">{country.shortDescription}</p>

        <div className="mt-4 space-y-2 text-xs text-muted-foreground">
          {country.tuitionRange && (
            <p className="flex items-center gap-2">
              <Wallet className="h-3.5 w-3.5 shrink-0 text-primary" />
              {country.tuitionRange}
            </p>
          )}
          {country.visaDuration && (
            <p className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
              {country.visaDuration}
            </p>
          )}
          {country.livingCost && (
            <p className="flex items-center gap-2">
              <Home className="h-3.5 w-3.5 shrink-0 text-primary" />
              {country.livingCost}
            </p>
          )}
        </div>

        {country.popularCourses && country.popularCourses.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {country.popularCourses.slice(0, 3).map((course) => (
              <span
                key={course}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-secondary/70"
              >
                {course}
              </span>
            ))}
          </div>
        )}

        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Loan details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

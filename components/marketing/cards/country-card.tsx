import Link from "next/link";
import type { MarketingCountry } from "@/types/marketing";
import { getCountryFlagLabel } from "@/lib/constants/marketing/countries";
import { ArrowRight, GraduationCap, Wallet, Clock, Home } from "lucide-react";

export function CountryCard({ country }: { country: MarketingCountry }) {
  return (
    <Link href={`/countries/${country.slug}`} className="card-premium group block p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
          {getCountryFlagLabel(country)}
        </span>
        <div>
          <h3 className="text-lg font-semibold text-secondary">{country.name}</h3>
          {country.studentCount && (
            <p className="text-xs text-muted-foreground">{country.studentCount}</p>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{country.shortDescription}</p>

      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
        {country.tuitionRange && (
          <p className="flex items-center gap-2">
            <Wallet className="h-3.5 w-3.5 text-primary" />
            {country.tuitionRange}
          </p>
        )}
        {country.visaDuration && (
          <p className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary" />
            {country.visaDuration}
          </p>
        )}
        {country.livingCost && (
          <p className="flex items-center gap-2">
            <Home className="h-3.5 w-3.5 text-primary" />
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

      {country.universities.length > 0 && (
        <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          {country.universities.slice(0, 2).join(", ")}
        </p>
      )}

      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        View Details
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

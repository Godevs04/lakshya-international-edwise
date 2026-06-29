import type { MarketingCountry } from "@/types/marketing";
import { MARKETING_COUNTRIES_RAW } from "./countries-data";

const COUNTRY_EXTRAS: Record<
  string,
  Pick<
    MarketingCountry,
    "flagEmoji" | "popularCourses" | "tuitionRange" | "visaDuration" | "livingCost" | "studentCount"
  >
> = {
  usa: {
    flagEmoji: "US",
    popularCourses: ["MS CS", "MBA", "Data Science"],
    tuitionRange: "USD 20K - 55K/yr",
    visaDuration: "F-1 Student Visa",
    livingCost: "USD 12K - 18K/yr",
    studentCount: "1.1M+ intl students",
  },
  canada: {
    flagEmoji: "CA",
    popularCourses: ["MBA", "PG Diploma", "Engineering"],
    tuitionRange: "CAD 18K - 35K/yr",
    visaDuration: "Study Permit",
    livingCost: "CAD 10K - 15K/yr",
    studentCount: "800K+ intl students",
  },
  uk: {
    flagEmoji: "GB",
    popularCourses: ["MSc", "MBA", "Law"],
    tuitionRange: "GBP 14K - 28K/yr",
    visaDuration: "Student Visa (4 yrs max)",
    livingCost: "GBP 12K - 15K/yr",
    studentCount: "600K+ intl students",
  },
  australia: {
    flagEmoji: "AU",
    popularCourses: ["IT", "Nursing", "Business"],
    tuitionRange: "AUD 22K - 40K/yr",
    visaDuration: "Subclass 500",
    livingCost: "AUD 15K - 20K/yr",
    studentCount: "700K+ intl students",
  },
  germany: {
    flagEmoji: "DE",
    popularCourses: ["Mechanical Eng", "CS", "Automotive"],
    tuitionRange: "EUR 0 - 20K/yr",
    visaDuration: "National Visa",
    livingCost: "EUR 11K blocked account",
    studentCount: "400K+ intl students",
  },
  ireland: {
    flagEmoji: "IE",
    popularCourses: ["Data Analytics", "Pharma", "Business"],
    tuitionRange: "EUR 12K - 25K/yr",
    visaDuration: "Stamp 2",
    livingCost: "EUR 10K - 14K/yr",
    studentCount: "35K+ intl students",
  },
  france: {
    flagEmoji: "FR",
    popularCourses: ["MBA", "Fashion", "Hospitality"],
    tuitionRange: "EUR 10K - 22K/yr",
    visaDuration: "Long-stay Student Visa",
    livingCost: "EUR 9K - 12K/yr",
    studentCount: "400K+ intl students",
  },
  "new-zealand": {
    flagEmoji: "NZ",
    popularCourses: ["Agriculture", "IT", "Tourism"],
    tuitionRange: "NZD 22K - 35K/yr",
    visaDuration: "Fee Paying Student Visa",
    livingCost: "NZD 15K - 18K/yr",
    studentCount: "100K+ intl students",
  },
  dubai: {
    flagEmoji: "AE",
    popularCourses: ["Business", "Hospitality", "Engineering"],
    tuitionRange: "AED 40K - 90K/yr",
    visaDuration: "Student Residence Permit",
    livingCost: "AED 30K - 50K/yr",
    studentCount: "Growing hub",
  },
  europe: {
    flagEmoji: "EU",
    popularCourses: ["Engineering", "Design", "Economics"],
    tuitionRange: "EUR 8K - 24K/yr",
    visaDuration: "Schengen / National",
    livingCost: "Varies by country",
    studentCount: "Multi-country options",
  },
};

function enrichCountry(country: MarketingCountry): MarketingCountry {
  const extras = COUNTRY_EXTRAS[country.slug];
  if (!extras) return country;
  return { ...country, ...extras };
}

export const MARKETING_COUNTRIES = MARKETING_COUNTRIES_RAW.map(enrichCountry);

export function getMarketingCountry(slug: string): MarketingCountry | undefined {
  return MARKETING_COUNTRIES.find((entry) => entry.slug === slug);
}

export function getCountryFlagLabel(country: MarketingCountry): string {
  return country.flagEmoji ?? country.flag;
}

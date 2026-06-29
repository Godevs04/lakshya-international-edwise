import type { MarketingCountry } from "@/types/marketing";

export const MARKETING_COUNTRIES: MarketingCountry[] = [
  {
    slug: "usa",
    name: "USA",
    flag: "US",
    shortDescription: "World-class universities and flexible programs.",
    description:
      "The United States offers diverse programs, strong research opportunities, and post-study work pathways for international students.",
    benefits: ["Top-ranked universities", "OPT opportunities", "Flexible majors", "Strong alumni networks"],
    universities: ["Arizona State University", "Northeastern University", "University of Texas at Arlington"],
    costOfStudy: "USD 20,000 - 55,000 per year (tuition varies by program and state)",
    visaInfo: "F-1 student visa with financial proof, SEVIS fee, and consular interview.",
    careerOutlook: "STEM graduates may access extended OPT and employer-sponsored pathways.",
  },
  {
    slug: "canada",
    name: "Canada",
    flag: "CA",
    shortDescription: "Quality education with welcoming immigration policies.",
    description:
      "Canada combines affordable education, multicultural campuses, and clear post-graduation work permit routes.",
    benefits: ["PGWP eligibility", "Safe cities", "Co-op programs", "PR-friendly pathways"],
    universities: ["University of Toronto", "Seneca College", "Conestoga College"],
    costOfStudy: "CAD 18,000 - 35,000 per year",
    visaInfo: "Study permit with GIC/financial proof and biometrics.",
    careerOutlook: "Graduates can apply for PGWP and later permanent residency programs.",
  },
  {
    slug: "uk",
    name: "United Kingdom",
    flag: "UK",
    shortDescription: "Shorter degrees with global recognition.",
    description:
      "The UK offers one-year masters programs, historic institutions, and graduate route visas for international talent.",
    benefits: ["1-year masters", "Graduate Route visa", "Global rankings", "Industry links"],
    universities: ["University of Manchester", "Coventry University", "University of Greenwich"],
    costOfStudy: "GBP 14,000 - 28,000 per year",
    visaInfo: "Student visa with CAS, financial evidence, and health surcharge.",
    careerOutlook: "Graduate Route allows work experience after studies.",
  },
  {
    slug: "australia",
    name: "Australia",
    flag: "AU",
    shortDescription: "High living standards and strong employability.",
    description:
      "Australia is known for practical courses, vibrant student cities, and post-study work rights.",
    benefits: ["Post-study work rights", "Quality of life", "Research universities", "Part-time work options"],
    universities: ["Monash University", "Deakin University", "University of South Australia"],
    costOfStudy: "AUD 22,000 - 40,000 per year",
    visaInfo: "Subclass 500 student visa with OSHC and financial capacity proof.",
    careerOutlook: "Temporary Graduate visa supports skilled employment after graduation.",
  },
  {
    slug: "germany",
    name: "Germany",
    flag: "DE",
    shortDescription: "Engineering excellence and affordable public universities.",
    description:
      "Germany offers strong STEM programs, industry internships, and low tuition at many public institutions.",
    benefits: ["Low tuition options", "STEM strength", "Industry internships", "EU mobility"],
    universities: ["TU Munich", "University of Stuttgart", "RWTH Aachen University"],
    costOfStudy: "EUR 0 - 20,000 per year (program dependent)",
    visaInfo: "National visa with blocked account or sponsor proof.",
    careerOutlook: "Graduates can explore EU job markets and residence permits.",
  },
  {
    slug: "ireland",
    name: "Ireland",
    flag: "IE",
    shortDescription: "Tech hub with English-medium education.",
    description:
      "Ireland attracts students to business, IT, and pharma programs with strong graduate employment in Dublin.",
    benefits: ["English-medium", "Tech employers", "Stay-back options", "EU access"],
    universities: ["Trinity College Dublin", "University College Dublin", "Dublin City University"],
    costOfStudy: "EUR 12,000 - 25,000 per year",
    visaInfo: "Stamp 2 permission with financial proof and college acceptance.",
    careerOutlook: "Third Level Graduate Scheme supports post-study employment.",
  },
  {
    slug: "france",
    name: "France",
    flag: "FR",
    shortDescription: "Business, design, and hospitality programs in Europe.",
    description:
      "France offers globally ranked business schools, cultural exposure, and English-taught masters in major cities.",
    benefits: ["Business schools", "Cultural exposure", "EU internships", "English programs"],
    universities: ["ESSEC Business School", "SKEMA Business School", "NEOMA Business School"],
    costOfStudy: "EUR 10,000 - 22,000 per year",
    visaInfo: "Long-stay student visa with Campus France process.",
    careerOutlook: "Graduates can pursue roles across EU markets.",
  },
  {
    slug: "new-zealand",
    name: "New Zealand",
    flag: "NZ",
    shortDescription: "Safe environment with practical learning.",
    description:
      "New Zealand provides quality education, outdoor lifestyle, and post-study work visas for skilled graduates.",
    benefits: ["Safe campuses", "Practical learning", "Post-study visa", "Smaller class sizes"],
    universities: ["University of Auckland", "Victoria University of Wellington", "Auckland University of Technology"],
    costOfStudy: "NZD 22,000 - 35,000 per year",
    visaInfo: "Fee Paying Student Visa with funds and health insurance.",
    careerOutlook: "Post-study work visa supports local employment experience.",
  },
  {
    slug: "dubai",
    name: "Dubai",
    flag: "AE",
    shortDescription: "Global branch campuses and business-focused programs.",
    description:
      "Dubai hosts international university branches with strong business, hospitality, and management pathways.",
    benefits: ["Branch campuses", "Tax-free earnings", "Global hub", "Industry exposure"],
    universities: ["Heriot-Watt University Dubai", "Middlesex University Dubai", "University of Birmingham Dubai"],
    costOfStudy: "AED 40,000 - 90,000 per year",
    visaInfo: "Student residence permit sponsored by the institution.",
    careerOutlook: "Regional employment in finance, hospitality, and logistics.",
  },
  {
    slug: "europe",
    name: "Europe",
    flag: "EU",
    shortDescription: "Multi-country pathways across the Schengen region.",
    description:
      "Explore programs in the Netherlands, Spain, Italy, and more with guidance on EU mobility and admissions.",
    benefits: ["Multi-country options", "English programs", "Erasmus opportunities", "Affordable cities"],
    universities: ["University of Amsterdam", "Bocconi University", "Eindhoven University of Technology"],
    costOfStudy: "EUR 8,000 - 24,000 per year (country dependent)",
    visaInfo: "Schengen or national student visas depending on destination.",
    careerOutlook: "Graduates benefit from EU mobility and multilingual workplaces.",
  },
];

export function getMarketingCountry(slug: string): MarketingCountry | undefined {
  return MARKETING_COUNTRIES.find((entry) => entry.slug === slug);
}

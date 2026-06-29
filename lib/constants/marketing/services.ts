import type { MarketingService } from "@/types/marketing";

export const MARKETING_SERVICES: MarketingService[] = [
  {
    slug: "study-abroad",
    title: "Study Abroad Counselling",
    shortDescription: "End-to-end guidance from shortlisting to enrollment.",
    description:
      "Personalized counselling to help students choose the right country, course, and university based on academic profile, budget, and career goals.",
    highlights: ["Profile assessment", "University shortlisting", "Application strategy", "Offer follow-up"],
    icon: "GraduationCap",
  },
  {
    slug: "education-loans",
    title: "Education Loans",
    shortDescription: "Compare lenders and secure funding with expert support.",
    description:
      "We partner with leading education loan providers to help students compare rates, eligibility, and documentation requirements.",
    highlights: ["Lender comparison", "Eligibility review", "Documentation support", "Disbursement tracking"],
    icon: "Landmark",
  },
  {
    slug: "visa-assistance",
    title: "Visa Assistance",
    shortDescription: "Structured visa filing with document checks and mock interviews.",
    description:
      "Country-specific visa guidance including document preparation, financial proof review, and interview readiness.",
    highlights: ["Document checklist", "Financial proof review", "Mock interviews", "Submission support"],
    icon: "FileCheck",
  },
  {
    slug: "scholarships",
    title: "Scholarships",
    shortDescription: "Identify merit and need-based funding opportunities.",
    description:
      "Support to discover scholarships, grants, and assistantships aligned with your academic profile and destination.",
    highlights: ["Scholarship mapping", "Application guidance", "Essay review", "Deadline tracking"],
    icon: "Award",
  },
  {
    slug: "documentation",
    title: "Documentation",
    shortDescription: "SOP, LOR, resume, and application document support.",
    description:
      "Professional assistance preparing statements of purpose, letters of recommendation, resumes, and university forms.",
    highlights: ["SOP drafting", "LOR guidance", "Resume polish", "Form completion"],
    icon: "FileText",
  },
  {
    slug: "accommodation",
    title: "Accommodation",
    shortDescription: "On-campus and off-campus housing guidance abroad.",
    description:
      "Help students evaluate housing options near their university with safety, budget, and commute considerations.",
    highlights: ["Housing options", "Budget planning", "Lease guidance", "Move-in checklist"],
    icon: "Home",
  },
  {
    slug: "forex",
    title: "Forex Services",
    shortDescription: "Competitive forex rates and remittance guidance.",
    description:
      "Guidance on tuition fee transfers, living expense remittances, and forex cards for international students.",
    highlights: ["Rate comparison", "Tuition transfers", "Forex cards", "Compliance guidance"],
    icon: "CircleDollarSign",
  },
  {
    slug: "travel-insurance",
    title: "Travel Insurance",
    shortDescription: "Student travel and health cover for your journey.",
    description:
      "Recommendations for travel and health insurance plans that meet university and visa requirements.",
    highlights: ["Policy comparison", "Visa-compliant cover", "Claims guidance", "Family add-ons"],
    icon: "Shield",
  },
];

export function getMarketingService(slug: string): MarketingService | undefined {
  return MARKETING_SERVICES.find((entry) => entry.slug === slug);
}

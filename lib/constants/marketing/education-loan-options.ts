import type { MarketingServiceSubOption } from "@/types/marketing";

export interface EducationLoanChecklistGroup {
  title: string;
  items: string[];
}

export interface EducationLoanTypeDetail {
  slug: string;
  title: string;
  shortDescription: string;
  icon: string;
  eyebrow: string;
  headline: string;
  summary: string[];
  highlights: string[];
  benefits: string[];
  destinations?: string[];
  trustPoints: string[];
  checklist: EducationLoanChecklistGroup[];
  closingLine: string;
}

export const EDUCATION_LOAN_TYPE_DETAILS: EducationLoanTypeDetail[] = [
  {
    slug: "without-guarantor",
    title: "Without Guarantor Loan",
    shortDescription:
      "Fund your studies without a financial guarantor — no repayment during school for eligible profiles.",
    icon: "Users",
    eyebrow: "Independent funding",
    headline: "Study abroad without a financial guarantor",
    summary: [
      "At Lakshya International Edwise, we help students access without-guarantor education loans through trusted international and Indian lenders such as MPOWER, Prodigy Finance, Avanse Global, and selected partners.",
      "With this option, students can pursue their dream education without requiring a parent, guardian, or relative to co-sign the loan. Your future is evaluated based on your education, career prospects, university, and course — not only your family's financial profile.",
      "This is ideal for ambitious students with strong academic potential and admission to reputed universities who may not have a financially eligible co-applicant.",
    ],
    highlights: [
      "100% independent loan — no parent or relative needs to guarantee",
      "Selected top universities with strong employment outcomes",
      "Covers tuition, living, insurance, books, and travel",
    ],
    benefits: [
      "No parent, guardian, or relative needs to co-sign the loan",
      "Available for selected universities with strong global rankings",
      "Wide course acceptance including STEM, Business, Management, Engineering, CS, Healthcare, Data Science, AI, and more",
      "Eligible destinations include USA, UK, Germany, Australia, France, and other leading study countries",
      "Competitive interest rates through trusted lending partners",
      "Covers major education expenses — tuition, living, accommodation, insurance, books, and travel",
      "Higher eligibility based on academic profile, university, and future earning potential",
      "Faster profile evaluation, lender matching, and decision support",
      "End-to-end assistance from documentation to disbursement",
    ],
    destinations: ["USA", "UK", "Germany", "Australia", "France", "Other eligible destinations"],
    trustPoints: [
      "Profile-first evaluation instead of family income alone",
      "Lender matching across international and Indian partners",
      "Transparent guidance from assessment to disbursement",
    ],
    checklist: [
      {
        title: "Student documents",
        items: [
          "Passport and visa / admission offer letter",
          "10th, 12th, and graduation mark sheets",
          "Degree / provisional certificate",
          "Entrance / language scores (IELTS, TOEFL, GRE, GMAT as applicable)",
          "University fee structure and cost of attendance",
          "Resume / CV and Statement of Purpose (if requested)",
        ],
      },
      {
        title: "Identity & KYC",
        items: [
          "Aadhaar and PAN",
          "Passport-size photographs",
          "Current address proof",
          "Student bank statements (if available)",
        ],
      },
      {
        title: "Profile strengtheners",
        items: [
          "Offer letter from an eligible university",
          "Course and career outcome details",
          "Any scholarship / assistantship confirmation",
          "Previous education loan documents (if any)",
        ],
      },
    ],
    closingLine: "No guarantor. No financial dependency. Just your dream — and our expertise.",
  },
  {
    slug: "non-collateral",
    title: "Non Collateral Loan",
    shortDescription: "Unsecured education loans up to ₹1.5 Cr — no property pledge required.",
    icon: "ShieldCheck",
    eyebrow: "No property pledge",
    headline: "Study abroad without pledging property",
    summary: [
      "A Non-Collateral Education Loan is designed for students who do not have an eligible property to offer as security but still want to pursue higher education abroad.",
      "While a financially eligible co-applicant is required, no collateral or property security is needed — making it an excellent option for families who meet income eligibility criteria.",
      "At Lakshya International Edwise, we partner with 15+ nationalized banks, private banks, and NBFCs to help students secure suitable non-collateral loans with faster approvals and transparent guidance.",
    ],
    highlights: [
      "No property or asset mortgage required",
      "Financial co-applicant with eligible income needed",
      "Complete cost of education coverage where lender policy allows",
    ],
    benefits: [
      "Obtain an education loan without mortgaging residential or commercial property",
      "A co-applicant with an eligible income profile supports the application",
      "Covers tuition, living, accommodation, travel, books, insurance, and visa-related costs",
      "Compare multiple lenders — nationalized banks, private banks, and NBFCs — on one platform",
      "Competitive interest rates and flexible repayment options based on lender policy",
      "Quick, transparent processing with dedicated relationship support",
      "Absolutely no hidden Lakshya service charges for students",
    ],
    trustPoints: [
      "Partnerships with 15+ banks and NBFCs",
      "Expert guidance to improve approval chances",
      "Complete assistance from application to disbursement",
    ],
    checklist: [
      {
        title: "Student academic & KYC",
        items: [
          "Passport, Aadhaar, and PAN",
          "10th, 12th, and graduation mark sheets / degree",
          "Admission / offer letter and fee structure",
          "Language / entrance test scores",
          "Passport-size photographs",
        ],
      },
      {
        title: "Co-applicant KYC",
        items: [
          "PAN, Aadhaar, and address proof",
          "Relationship proof with the student",
          "Passport-size photographs",
          "Bank statements (last 6–12 months)",
        ],
      },
      {
        title: "Co-applicant income proof",
        items: [
          "Salaried: salary slips, Form 16, ITR (as applicable)",
          "Self-employed: ITR, business proof, P&L / balance sheet if available",
          "Pensioner: PPO / pension certificate and bank credits",
          "Agricultural income: Pattadar passbook and agriculture income certificate",
          "Rental income: rental agreements and corresponding bank credits",
        ],
      },
    ],
    closingLine:
      "No property security. Trusted financial support. Endless global opportunities.",
  },
  {
    slug: "collateral",
    title: "Collateral Loan",
    shortDescription: "Secured loans up to ₹2 Cr with the lowest interest from top banks.",
    icon: "Building2",
    eyebrow: "Secured funding",
    headline: "Higher funding with the best interest rates",
    summary: [
      "For students planning higher education abroad, a Collateral Education Loan is one of the most reliable and cost-effective financing options.",
      "By pledging an eligible property or approved security, students can access higher loan amounts, lower interest rates, and comprehensive funding for overseas education.",
      "At Lakshya International Edwise, we have partnered with 15+ leading financial institutions — including nationalized banks, private banks, and NBFCs — to help students secure the most suitable secured education loan.",
    ],
    highlights: [
      "Lower interest rates starting from about 8.25%",
      "Higher loan eligibility for complete cost of education",
      "Flexible repayment with attractive moratorium benefits",
    ],
    benefits: [
      "Competitive education loan interest rates in the market",
      "Higher loan eligibility depending on profile and lender policy",
      "Comprehensive coverage — tuition, living, accommodation, travel, books, insurance, and visa-related costs",
      "Student-friendly repayment structures with moratorium benefits",
      "Lower processing costs and better overall loan terms versus many alternatives",
      "Suitable for recognized universities across USA, UK, Canada, Germany, Australia, France, Ireland, and more",
      "End-to-end support for property evaluation, legal verification, sanction, and disbursement",
    ],
    destinations: [
      "USA",
      "UK",
      "Canada",
      "Germany",
      "Australia",
      "France",
      "Ireland",
      "Other leading destinations",
    ],
    trustPoints: [
      "Partnerships with 15+ nationalized banks, private banks & NBFCs",
      "Expert comparison across lenders for the best offer",
      "Transparent guidance with dedicated relationship support",
    ],
    checklist: [
      {
        title: "Student & co-applicant basics",
        items: [
          "Student KYC, academic documents, and offer letter",
          "Co-applicant KYC and income documents",
          "Fee structure and cost of attendance",
          "Bank statements as required by the lender",
        ],
      },
      {
        title: "Property collateral documents",
        items: [
          "Sale deed / title deed / gift or partition deed",
          "Encumbrance Certificate (EC)",
          "Latest property tax receipts",
          "Approved building plan",
          "Occupancy certificate (if applicable)",
          "Khata / mutation records as applicable",
          "Valuation report (generally arranged by the lender)",
        ],
      },
      {
        title: "Other accepted securities (lender-dependent)",
        items: [
          "Fixed deposit receipts",
          "Insurance policy documents (if accepted)",
          "Other approved movable / immovable securities",
          "Legal and technical verification clearance",
        ],
      },
    ],
    closingLine:
      "Higher loan amounts. Lower interest rates. Complete financial support — powered by Lakshya International Edwise.",
  },
];

export const EDUCATION_LOAN_OPTIONS: MarketingServiceSubOption[] =
  EDUCATION_LOAN_TYPE_DETAILS.map(({ slug, title, shortDescription, icon }) => ({
    slug,
    title,
    shortDescription,
    icon,
  }));

export function getEducationLoanOptionHref(slug: string): string {
  return `/services/education-loan#${slug}`;
}

export function getEducationLoanTypeDetail(
  slug: string
): EducationLoanTypeDetail | undefined {
  return EDUCATION_LOAN_TYPE_DETAILS.find((entry) => entry.slug === slug);
}

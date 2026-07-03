export type EnquiryType =
  | "consultation"
  | "quick"
  | "contact"
  | "loan"
  | "country"
  | "eligibility";

export type LeadFormVariant = EnquiryType;

export type MegaMenuType = "services" | "countries" | "resources" | "none";

export interface MarketingNavItem {
  label: string;
  href: string;
  megaMenu?: MegaMenuType;
  children?: MarketingNavItem[];
}

export type LenderCategory =
  | "government"
  | "private"
  | "nbfc"
  | "international";

export interface MarketingLender {
  name: string;
  slug: string;
  logo?: string;
  logoWidth?: number;
  logoHeight?: number;
  /** CSS display height in px — tuned per logo aspect ratio */
  logoDisplayHeight?: number;
  /** CSS max width in px — prevents wide or square logos from dominating */
  logoMaxWidth?: number;
  accent?: string;
  category: LenderCategory;
  roiFrom: number;
  maxLoanLabel: string;
  processingLabel: string;
  unsecured?: boolean;
  featured?: boolean;
}

export interface MarketingServiceSubOption {
  slug: string;
  title: string;
  shortDescription: string;
  icon: string;
}

export interface MarketingService {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  highlights: string[];
  icon: string;
  subOptions?: MarketingServiceSubOption[];
}

export interface MarketingCountry {
  slug: string;
  name: string;
  flag: string;
  flagEmoji?: string;
  shortDescription: string;
  description: string;
  benefits: string[];
  universities: string[];
  popularCourses?: string[];
  costOfStudy: string;
  tuitionRange?: string;
  visaInfo: string;
  visaDuration?: string;
  livingCost?: string;
  studentCount?: string;
  careerOutlook: string;
}

export interface MarketingTestimonial {
  id: string;
  name: string;
  role: string;
  country: string;
  destinationFlag?: string;
  university?: string;
  quote: string;
  rating: number;
  photo?: string;
  visaStatus?: string;
  videoUrl?: string;
}

export interface MarketingFaq {
  question: string;
  answer: string;
  category?: string;
}

export interface MarketingAward {
  title: string;
  year?: string;
  description?: string;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}

export interface WhyChooseItem {
  title: string;
  description: string;
  icon: string;
}

export interface OfficeLocation {
  name: string;
  address: string;
  hours: string;
  phone?: string;
}

export interface GoogleReviewPlaceholder {
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface MarketingTrustMetrics {
  studentCount: number;
  studentCountLabel: string;
  rating: number;
  reviewCount: number;
  visaSuccessRate: number;
  responseTimeMinutes: number;
}

export interface MarketingStat {
  label: string;
  value: number;
  suffix: string;
  description?: string;
  icon?: string;
}

export type EnquiryType =
  | "consultation"
  | "quick"
  | "contact"
  | "loan"
  | "country";

export type LeadFormVariant = EnquiryType;

export type MegaMenuType = "services" | "countries" | "resources" | "none";

export interface MarketingNavItem {
  label: string;
  href: string;
  megaMenu?: MegaMenuType;
  children?: MarketingNavItem[];
}

export interface MarketingService {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  highlights: string[];
  icon: string;
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

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  coverImage?: string;
  author: string;
  readingTimeMinutes?: number;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

export interface MarketingPartnerUniversity {
  name: string;
  country: string;
  logo?: string;
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

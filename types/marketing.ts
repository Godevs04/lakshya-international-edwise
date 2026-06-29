export type EnquiryType =
  | "consultation"
  | "quick"
  | "contact"
  | "loan"
  | "country";

export type LeadFormVariant = EnquiryType;

export interface MarketingNavItem {
  label: string;
  href: string;
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
  shortDescription: string;
  description: string;
  benefits: string[];
  universities: string[];
  costOfStudy: string;
  visaInfo: string;
  careerOutlook: string;
}

export interface MarketingTestimonial {
  id: string;
  name: string;
  role: string;
  country: string;
  quote: string;
  rating: number;
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
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

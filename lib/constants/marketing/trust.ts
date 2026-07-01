import type { MarketingTrustMetrics } from "@/types/marketing";

export const MARKETING_TRUST: MarketingTrustMetrics = {
  studentCount: 8500,
  studentCountLabel: "8,500+ students guided",
  rating: 4.9,
  reviewCount: 1200,
  visaSuccessRate: 98,
  responseTimeMinutes: 30,
};

export const MARKETING_HERO_TAGS = [
  "Admissions",
  "Education Loans",
  "Visa Support",
  "Scholarships",
] as const;

export const MARKETING_HERO_STUDENT_PHOTOS = [
  { src: "/marketing/students/student-1.svg", alt: "Student success story" },
  { src: "/marketing/students/student-2.svg", alt: "Graduate celebration" },
  { src: "/marketing/students/student-3.svg", alt: "International student" },
  { src: "/marketing/students/student-4.svg", alt: "Study abroad journey" },
] as const;

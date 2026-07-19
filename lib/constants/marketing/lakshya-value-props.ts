export interface ValueProp {
  title: string;
  description: string;
  icon: string;
  stat?: string;
}

export interface TrustMetric {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  decimals?: number;
}

export const TRUST_METRICS: TrustMetric[] = [
  { value: 20, suffix: "K+", label: "Students Served" },
  { value: 20, suffix: "+", label: "Trusted Lending Partners" },
  { value: 73, suffix: " hrs", label: "Average Approval" },
  { value: 8.25, suffix: "%", label: "ROI Starts From", decimals: 2 },
];

export const TRUST_METRICS_SOURCE =
  "Figures based on cumulative student enquiries, partner lender network, and average sanction timelines (FY 2024–25). Rates are indicative and subject to lender policy.";

export const HOW_IT_WORKS_STEPS: ValueProp[] = [
  { title: "Check Eligibility", description: "7 minutes", icon: "ShieldCheck" },
  { title: "Document Verification", description: "Same day", icon: "FileText" },
  { title: "Approval", description: "73 hours", icon: "TrendingUp" },
  { title: "Disbursement", description: "8 days", icon: "Wallet" },
  { title: "Fly Abroad", description: "Success", icon: "Plane" },
];

export const WHY_LAKSHYA: ValueProp[] = [
  { title: "20+ Lending Partners", description: "Banks, NBFCs & international lenders in one place.", icon: "Landmark" },
  { title: "73-Hour Approvals", description: "Fast-tracked sanctions when timelines are tight.", icon: "TrendingUp" },
  { title: "Up to ₹2 Crore", description: "Fund tuition and living costs, 100% coverage.", icon: "Wallet" },
  { title: "ROI From 8.25%", description: "We negotiate the lowest possible interest for you.", icon: "Sparkles" },
  { title: "Zero Service Charges", description: "Our guidance is completely free for students.", icon: "HeartHandshake" },
  { title: "End-to-End Support", description: "From eligibility to disbursement and beyond.", icon: "Route" },
];

export const WHAT_LAKSHYA_ACCEPTS: ValueProp[] = [
  { title: "Low CIBIL Score", description: "We work with lenders who look beyond the score.", icon: "ShieldCheck", stat: "92% approval rate" },
  { title: "Zero / Low Income", description: "Options that don't hinge on family income.", icon: "Wallet", stat: "Flexible income proof" },
  { title: "No Guarantor", description: "Without-guarantor loans for eligible profiles.", icon: "Users", stat: "No guarantor needed" },
  { title: "No Financial Proof", description: "Non-collateral, no-document-heavy pathways.", icon: "FileText", stat: "Low CIBIL accepted" },
  { title: "Rejected Elsewhere", description: "We re-package profiles other lenders declined.", icon: "Route" },
  { title: "Academic / Gap Year", description: "Backlogs and gap years are not deal-breakers.", icon: "Calendar" },
];

export const WHAT_LAKSHYA_GIVES_BACK: ValueProp[] = [
  { title: "50% Fee Discount", description: "Up to half off processing fees with partners.", icon: "Sparkles", stat: "Save up to 50%" },
  { title: "Lower Interest Rates", description: "Negotiated ROI below standard offers.", icon: "TrendingUp", stat: "From 8.25% ROI" },
  { title: "Fast Processing", description: "73-hour approvals on eligible applications.", icon: "TrendingUp", stat: "73-hour approval" },
  { title: "100% Cost Coverage", description: "Tuition, living, insurance and visa fees.", icon: "Wallet" },
  { title: "Visa & Fee Support", description: "Blocked account, GIC and university fee help.", icon: "ShieldCheck" },
  { title: "Pan-India Support", description: "Guidance in your language, wherever you are.", icon: "MapPin" },
];

export interface AboutMilestone {
  year: string;
  title: string;
  description: string;
}

export const ABOUT_MILESTONES: AboutMilestone[] = [
  { year: "Mission", title: "Make global education affordable", description: "Remove the funding barrier so every deserving student can study abroad." },
  { year: "Vision", title: "India's most trusted loan partner", description: "Be the finance partner students and consultants rely on, without channel conflict." },
  { year: "Approach", title: "Students first, always", description: "Transparent, unbiased comparisons across every lender we work with." },
];

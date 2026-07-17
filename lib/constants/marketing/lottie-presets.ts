import compareBarsAnimation from "@/public/lottie/compare-bars.json";
import businessAnalysisAnimation from "@/public/lottie/Business Analysis.json";
import contactUsAnimation from "@/public/lottie/Contact_us.json";
import globeOrbitAnimation from "@/public/lottie/globe-orbit.json";
import partnerHandshakeAnimation from "@/public/lottie/Stickman and woman handshake.json";
import liveChatbotAnimation from "@/public/lottie/Live_chatbot.json";
import livePulseAnimation from "@/public/lottie/live-pulse.json";
import loanApprovedAnimation from "@/public/lottie/loan-approved.json";
import loanCalculatorAnimation from "@/public/lottie/loan-calculator.json";
import searchEmptyAnimation from "@/public/lottie/search-empty.json";
import pageNotFoundAnimation from "@/public/lottie/Page Not Found 404.json";

export type MarketingLottiePreset =
  | "loan-calculator"
  | "loan-approved"
  | "compare-bars"
  | "globe-orbit"
  | "search-empty"
  | "live-pulse"
  | "live-chatbot"
  | "contact-us"
  | "partner-handshake"
  | "business-analysis"
  | "page-not-found";

export type MarketingLottieAnimation = object;

export const MARKETING_LOTTIE_PRESETS: Record<
  MarketingLottiePreset,
  MarketingLottieAnimation
> = {
  "loan-calculator": loanCalculatorAnimation,
  "loan-approved": loanApprovedAnimation,
  "compare-bars": compareBarsAnimation,
  "globe-orbit": globeOrbitAnimation,
  "search-empty": searchEmptyAnimation,
  "live-pulse": livePulseAnimation,
  "live-chatbot": liveChatbotAnimation,
  "contact-us": contactUsAnimation,
  "partner-handshake": partnerHandshakeAnimation,
  "business-analysis": businessAnalysisAnimation,
  "page-not-found": pageNotFoundAnimation,
};

export interface MarketingLottiePlayerProps {
  preset: MarketingLottiePreset;
  loop?: boolean;
  className?: string;
}

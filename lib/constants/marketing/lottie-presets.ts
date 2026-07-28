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
  | "page-not-found"
  | "about";

export type MarketingLottieAnimation = object;

const PRESET_LOADERS: Record<
  MarketingLottiePreset,
  () => Promise<{ default: MarketingLottieAnimation }>
> = {
  "loan-calculator": () => import("@/public/lottie/loan-calculator.json"),
  "loan-approved": () => import("@/public/lottie/loan-approved.json"),
  "compare-bars": () => import("@/public/lottie/compare-bars.json"),
  "globe-orbit": () => import("@/public/lottie/globe-orbit.json"),
  "search-empty": () => import("@/public/lottie/search-empty.json"),
  "live-pulse": () => import("@/public/lottie/live-pulse.json"),
  "live-chatbot": () => import("@/public/lottie/Live_chatbot.json"),
  "contact-us": () => import("@/public/lottie/Contact_us.json"),
  "partner-handshake": () => import("@/public/lottie/Stickman and woman handshake.json"),
  "business-analysis": () => import("@/public/lottie/Business Analysis.json"),
  "page-not-found": () => import("@/public/lottie/Page Not Found 404.json"),
  about: () => import("@/public/lottie/About.json"),
};

/** Lazy-load a single Lottie JSON so pages do not ship the full ~2MB preset barrel. */
export async function loadMarketingLottiePreset(
  preset: MarketingLottiePreset
): Promise<MarketingLottieAnimation> {
  const mod = await PRESET_LOADERS[preset]();
  if (mod && typeof mod === "object" && "default" in mod && mod.default) {
    return mod.default as MarketingLottieAnimation;
  }
  return mod as unknown as MarketingLottieAnimation;
}

export interface MarketingLottiePlayerProps {
  preset: MarketingLottiePreset;
  loop?: boolean;
  className?: string;
}

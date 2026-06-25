import { Design06RibbonWaves } from "@/components/layout/design06-ribbon-waves";

export function PremiumBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden premium-bg">
      <Design06RibbonWaves variant="ambient" className="opacity-28" />
    </div>
  );
}

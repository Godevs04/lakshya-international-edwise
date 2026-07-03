import { MarketingContainer } from "@/components/marketing/layout/marketing-container";
import { AnimatedCounter } from "@/components/marketing/motion/counter";
import { TRUST_METRICS } from "@/lib/constants/marketing/lakshya-value-props";

export function TrustMetricsBar() {
  return (
    <section className="border-y border-border/60 bg-white py-10" aria-label="Key metrics">
      <MarketingContainer>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {TRUST_METRICS.map((metric) => (
            <div key={metric.label} className="text-center">
              <p className="text-3xl font-extrabold text-primary md:text-4xl">
                {metric.prefix}
                <AnimatedCounter
                  value={metric.value}
                  suffix={metric.suffix}
                  decimals={metric.decimals ?? 0}
                />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}

"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { MarketingContainer } from "@/components/marketing/layout/marketing-container";
import { AnimatedCounter } from "@/components/marketing/motion/counter";
import { RevealItem, RevealStagger } from "@/components/marketing/motion/reveal";
import { MarketingLottie } from "@/components/marketing/motion/marketing-lottie";
import type { MarketingLottiePreset } from "@/lib/constants/marketing/lottie-presets";

export interface PageHeroStat {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

export interface PageHeroPremiumProps {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
  icon?: React.ReactNode;
  stats?: PageHeroStat[];
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  decorativeLottie?: MarketingLottiePreset;
  children?: React.ReactNode;
}

export function PageHeroPremium({
  eyebrow,
  title,
  titleAccent,
  description,
  className,
  align = "left",
  icon,
  stats,
  primaryCta,
  secondaryCta,
  decorativeLottie,
  children,
}: PageHeroPremiumProps) {
  const centered = align === "center";

  return (
    <section
      className={cn(
        "page-hero-premium section-relative overflow-hidden pb-12 pt-14 md:pb-16 md:pt-20",
        className
      )}
    >
      <div className="page-hero-premium-bg" aria-hidden>
        <span className="page-hero-premium-orb page-hero-premium-orb-1" />
        <span className="page-hero-premium-orb page-hero-premium-orb-2" />
      </div>

      {decorativeLottie ? (
        <MarketingLottie
          preset={decorativeLottie}
          variant="inline"
          className="page-hero-premium-lottie"
          playerClassName="page-hero-premium-lottie-player"
        />
      ) : null}

      <MarketingContainer size="premium" className="relative z-10">
        <RevealStagger className={cn("max-w-3xl", centered && "mx-auto text-center")}>
          {icon ? (
            <RevealItem>
              <div className={cn("mb-5", centered && "flex justify-center")}>{icon}</div>
            </RevealItem>
          ) : null}
          {eyebrow ? (
            <RevealItem>
              <p className="hero-eyebrow">{eyebrow}</p>
            </RevealItem>
          ) : null}
          <RevealItem>
            <h1 className={cn("hero-premium-heading mt-4", centered && "mt-5")}>
              <span className="text-[#0b1e48]">{title}</span>
              {titleAccent ? (
                <>
                  <br />
                  <span className="hero-premium-heading-accent">{titleAccent}</span>
                </>
              ) : null}
            </h1>
          </RevealItem>
          {description ? (
            <RevealItem>
              <p
                className={cn(
                  "prose-marketing mt-5 text-lg text-muted-foreground",
                  centered && "mx-auto max-w-2xl"
                )}
              >
                {description}
              </p>
            </RevealItem>
          ) : null}
          {stats && stats.length > 0 ? (
            <RevealItem>
              <div
                className={cn(
                  "mt-8 flex flex-wrap gap-6 md:gap-10",
                  centered && "justify-center"
                )}
              >
                {stats.map((stat) => (
                  <div key={stat.label} className="text-left">
                    <p className="text-2xl font-bold text-primary md:text-3xl">
                      <AnimatedCounter
                        value={stat.value}
                        suffix={stat.suffix}
                        prefix={stat.prefix}
                        variant="scramble"
                      />
                    </p>
                    <p className="mt-1 text-sm font-medium text-secondary/80">{stat.label}</p>
                  </div>
                ))}
              </div>
            </RevealItem>
          ) : null}
          {(primaryCta || secondaryCta || children) && (
            <RevealItem>
              <div
                className={cn(
                  "mt-8 flex flex-wrap gap-3",
                  centered && "justify-center"
                )}
              >
                {primaryCta ? (
                  <Link
                    href={primaryCta.href}
                    className="btn-marketing rounded-full px-6 py-3 text-sm font-semibold"
                  >
                    {primaryCta.label}
                  </Link>
                ) : null}
                {secondaryCta ? (
                  <Link
                    href={secondaryCta.href}
                    className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-secondary hover:bg-muted"
                  >
                    {secondaryCta.label}
                  </Link>
                ) : null}
                {children}
              </div>
            </RevealItem>
          )}
        </RevealStagger>
      </MarketingContainer>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MARKETING_STATS } from "@/lib/constants/marketing/stats";
import { fadeInUp } from "@/lib/motion/marketing";

function AnimatedStat({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 30;
    const timer = window.setInterval(() => {
      frame += 1;
      setCount(Math.round((value * frame) / totalFrames));
      if (frame >= totalFrames) window.clearInterval(timer);
    }, 20);
    return () => window.clearInterval(timer);
  }, [value]);

  return (
    <span>
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export function StatsBar() {
  return (
    <section className="border-y border-border bg-muted/40 py-10">
      <div className="container mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 md:grid-cols-5">
        {MARKETING_STATS.map((stat) => (
          <motion.div key={stat.label} {...fadeInUp} className="text-center">
            <p className="text-2xl font-bold text-primary md:text-3xl">
              <AnimatedStat value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

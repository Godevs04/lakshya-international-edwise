"use client";

import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 12;

export function useNavbarScroll() {
  const [compact, setCompact] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setCompact(y > SCROLL_THRESHOLD);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(y / docHeight, 1) : 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { compact, progress };
}

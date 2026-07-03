export const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
} as const;

export const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.45 },
} as const;

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
} as const;

export const blurIn = {
  initial: { opacity: 0, filter: "blur(8px)" },
  whileInView: { opacity: 1, filter: "blur(0px)" },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
} as const;

export const slideLeft = {
  initial: { opacity: 0, x: 24 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
} as const;

export const pulseOnce = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.04, 1] },
  transition: { duration: 0.5, ease: "easeOut" },
} as const;

export const floatSlow = {
  animate: { y: [0, -4, 0] },
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const },
} as const;

export const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.08 } },
  viewport: { once: true },
} as const;

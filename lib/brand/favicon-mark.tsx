import { BRAND } from "@/lib/design/tokens";

interface FaviconMarkProps {
  initial: string;
  size: number;
}

/**
 * Shared favicon / PWA mark — matches sidebar logo styling (gradient squircle + initial).
 */
export function FaviconMark({ initial, size }: FaviconMarkProps) {
  const radius = Math.round(size * 0.24);
  const fontSize = Math.round(size * 0.5);
  const accent = Math.round(size * 0.09);
  const ring = Math.max(2, Math.round(size * 0.018));

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND.background,
      }}
    >
      <div
        style={{
          position: "relative",
          width: Math.round(size * 0.88),
          height: Math.round(size * 0.88),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radius,
          background: `linear-gradient(145deg, ${BRAND.primary} 0%, ${BRAND.secondary} 55%, #4F46E5 100%)`,
          border: `${ring}px solid rgba(255, 255, 255, 0.28)`,
          boxShadow: `0 ${Math.round(size * 0.06)}px ${Math.round(size * 0.14)}px rgba(109, 94, 247, 0.45)`,
        }}
      >
        {/* Top highlight */}
        <div
          style={{
            position: "absolute",
            top: Math.round(size * 0.1),
            left: Math.round(size * 0.14),
            width: Math.round(size * 0.42),
            height: Math.round(size * 0.14),
            borderRadius: 9999,
            background: "rgba(255, 255, 255, 0.22)",
          }}
        />

        <span
          style={{
            position: "relative",
            fontSize,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "-0.05em",
            lineHeight: 1,
            marginTop: -Math.round(size * 0.02),
          }}
        >
          {initial}
        </span>

        {/* Accent dot — education / growth cue */}
        <div
          style={{
            position: "absolute",
            right: Math.round(size * 0.16),
            bottom: Math.round(size * 0.16),
            width: accent,
            height: accent,
            borderRadius: 9999,
            background: BRAND.accent,
            border: `${Math.max(1, ring - 1)}px solid rgba(255, 255, 255, 0.5)`,
          }}
        />
      </div>
    </div>
  );
}

export function getBrandInitial(name: string): string {
  const trimmed = name.trim();
  return (trimmed.charAt(0) || "L").toUpperCase();
}

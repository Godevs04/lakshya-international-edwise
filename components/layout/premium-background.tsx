export function PremiumBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden premium-bg noise-overlay">
      <div className="premium-orb premium-orb-1 absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#6D5EF7]/20 blur-[100px]" />
      <div className="premium-orb premium-orb-2 absolute -right-32 top-40 h-80 w-80 rounded-full bg-[#06B6D4]/15 blur-[100px]" />
      <div className="premium-orb premium-orb-3 absolute bottom-20 left-1/3 h-72 w-72 rounded-full bg-[#EC4899]/10 blur-[100px]" />
      <div className="premium-orb premium-orb-4 absolute bottom-40 right-1/4 h-64 w-64 rounded-full bg-[#8B5CF6]/15 blur-[80px]" />
    </div>
  );
}

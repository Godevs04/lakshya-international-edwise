import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import {
  WHY_LAKSHYA,
  WHAT_LAKSHYA_ACCEPTS,
  WHAT_LAKSHYA_GIVES_BACK,
} from "@/lib/constants/marketing/lakshya-value-props";

const BRANCHES = [
  {
    key: "why",
    title: "Why Lakshya",
    blurb: "The finance partner built around students.",
    items: WHY_LAKSHYA.slice(0, 4),
  },
  {
    key: "accepts",
    title: "What Lakshya Accepts",
    blurb: "Profiles others turn away, we take forward.",
    items: WHAT_LAKSHYA_ACCEPTS.slice(0, 4),
  },
  {
    key: "gives",
    title: "What Lakshya Gives Back",
    blurb: "Real savings and support, not just approvals.",
    items: WHAT_LAKSHYA_GIVES_BACK.slice(0, 4),
  },
];

export function LakshyaRootMap() {
  return (
    <SectionShell
      variant="muted"
      eyebrow="Why Choose Us"
      title="One partner, three promises"
      description="From eligibility to disbursement, here is what sets Lakshya apart."
      align="center"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {BRANCHES.map((branch) => (
          <div key={branch.key} className="card-premium p-6">
            <div className="mb-5 border-b border-border/60 pb-5 text-center">
              <h3 className="text-xl font-bold text-primary">{branch.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{branch.blurb}</p>
            </div>
            <ul className="space-y-4">
              {branch.items.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                    <MarketingIcon name={item.icon} className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

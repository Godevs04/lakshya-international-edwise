"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const GALLERY_CATEGORIES = ["All", "Events", "Counselling", "Success", "Workshops"] as const;

const GALLERY_ITEMS = [
  { id: "1", title: "Counselling Session", category: "Counselling", color: "from-emerald-100 to-emerald-50" },
  { id: "2", title: "University Fair", category: "Events", color: "from-sky-100 to-sky-50" },
  { id: "3", title: "Visa Success", category: "Success", color: "from-violet-100 to-violet-50" },
  { id: "4", title: "Student Orientation", category: "Events", color: "from-amber-100 to-amber-50" },
  { id: "5", title: "Loan Workshop", category: "Workshops", color: "from-rose-100 to-rose-50" },
  { id: "6", title: "Alumni Meet", category: "Success", color: "from-teal-100 to-teal-50" },
];

export function GalleryGrid() {
  const [active, setActive] = useState<(typeof GALLERY_ITEMS)[number] | null>(null);
  const [category, setCategory] = useState<string>("All");

  const filtered =
    category === "All"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === category);

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {GALLERY_CATEGORIES.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setCategory(entry)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              category === entry
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {entry}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item)}
            className={`card-premium group relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${item.color}`}
          >
            <div className="absolute inset-0 flex flex-col items-start justify-end p-4">
              <span className="mb-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {item.category}
              </span>
              <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-secondary">
                {item.title}
              </span>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={Boolean(active)} onOpenChange={() => setActive(null)}>
        <DialogContent className="max-w-2xl">
          {active && (
            <div className={`aspect-video rounded-xl bg-gradient-to-br ${active.color} p-6`}>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">{active.category}</p>
              <h3 className="mt-1 text-lg font-semibold text-secondary">{active.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Gallery media can be connected to Cloudinary assets when photos are available.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

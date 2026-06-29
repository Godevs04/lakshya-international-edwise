"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const GALLERY_ITEMS = [
  { id: "1", title: "Counselling Session", color: "from-emerald-100 to-emerald-50" },
  { id: "2", title: "University Fair", color: "from-sky-100 to-sky-50" },
  { id: "3", title: "Visa Success", color: "from-violet-100 to-violet-50" },
  { id: "4", title: "Student Orientation", color: "from-amber-100 to-amber-50" },
  { id: "5", title: "Loan Workshop", color: "from-rose-100 to-rose-50" },
  { id: "6", title: "Alumni Meet", color: "from-teal-100 to-teal-50" },
];

export function GalleryGrid() {
  const [active, setActive] = useState<(typeof GALLERY_ITEMS)[number] | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GALLERY_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item)}
            className={`group relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br ${item.color}`}
          >
            <div className="absolute inset-0 flex items-end p-4">
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
              <h3 className="text-lg font-semibold text-secondary">{active.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Gallery media can be connected to Cloudinary assets in a later content update.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeadForm } from "@/components/marketing/forms/lead-form";

const STORAGE_KEY = "lie-enquiry-popup-seen";

export function EnquiryDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
    }, 12000);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="marketing-site max-w-lg border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle>Plan your study abroad journey</DialogTitle>
          <DialogDescription>
            Book a free consultation with our expert counsellors.
          </DialogDescription>
        </DialogHeader>
        <LeadForm variant="quick" formPage="/" compact />
      </DialogContent>
    </Dialog>
  );
}

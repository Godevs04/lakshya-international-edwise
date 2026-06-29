"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitWebsiteEnquiryAction } from "@/lib/actions/enquiry.actions";
import type { LeadFormVariant } from "@/types/marketing";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const leadFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  targetCountry: z.string().optional(),
  course: z.string().optional(),
  loanRequired: z.boolean().optional(),
  message: z.string().optional(),
  website: z.string().max(0).optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  variant?: LeadFormVariant;
  formPage?: string;
  defaultCountry?: string;
  className?: string;
  compact?: boolean;
}

export function LeadForm({
  variant = "consultation",
  formPage,
  defaultCountry,
  className,
  compact = false,
}: LeadFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      targetCountry: defaultCountry ?? "",
      course: "",
      loanRequired: variant === "loan",
      message: "",
      website: "",
    },
  });

  function onSubmit(values: LeadFormValues) {
    setError(null);
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("phone", values.phone);
    formData.set("enquiryType", variant);
    if (formPage) formData.set("formPage", formPage);
    if (values.email) formData.set("email", values.email);
    if (values.targetCountry) formData.set("targetCountry", values.targetCountry);
    if (values.course) formData.set("course", values.course);
    if (values.loanRequired) formData.set("loanRequired", "true");
    if (values.message) formData.set("message", values.message);
    if (values.website) formData.set("website", values.website);

    startTransition(async () => {
      const result = await submitWebsiteEnquiryAction(formData);
      if (result.success) {
        setSubmitted(true);
        form.reset();
      } else {
        setError(result.error ?? "Unable to submit. Please try again.");
      }
    });
  }

  const showCountry = variant === "country" || variant === "consultation" || variant === "quick";
  const showCourse = variant !== "contact";
  const showLoan = variant === "loan" || variant === "consultation";
  const showMessage = variant === "contact" || variant === "consultation";

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("glass-card rounded-2xl p-6 text-center", className)}
      >
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-primary" />
        <h3 className="text-lg font-semibold text-secondary">Thank you!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Our counsellors will contact you within one business day.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("glass-card rounded-2xl p-5 md:p-6", className)}
    >
      <div className={cn("grid gap-4", compact ? "grid-cols-1" : "md:grid-cols-2")}>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="lead-name">Full name</Label>
          <Input id="lead-name" {...form.register("name")} placeholder="Your name" />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lead-phone">Phone</Label>
          <Input id="lead-phone" {...form.register("phone")} placeholder="10-digit mobile" />
          {form.formState.errors.phone && (
            <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lead-email">Email (optional)</Label>
          <Input id="lead-email" type="email" {...form.register("email")} placeholder="you@email.com" />
        </div>
        {showCountry && (
          <div className="space-y-2">
            <Label htmlFor="lead-country">Target country</Label>
            <Input id="lead-country" {...form.register("targetCountry")} placeholder="e.g. Canada" />
          </div>
        )}
        {showCourse && (
          <div className="space-y-2">
            <Label htmlFor="lead-course">Course (optional)</Label>
            <Input id="lead-course" {...form.register("course")} placeholder="e.g. MBA" />
          </div>
        )}
        {showLoan && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground md:col-span-2">
            <input type="checkbox" {...form.register("loanRequired")} className="rounded border-border" />
            I need education loan assistance
          </label>
        )}
        {showMessage && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="lead-message">Message (optional)</Label>
            <textarea
              id="lead-message"
              {...form.register("message")}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Tell us about your study plans"
            />
          </div>
        )}
        <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...form.register("website")} />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <Button type="submit" disabled={isPending} className="btn-marketing mt-4 w-full rounded-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Book Free Consultation"
        )}
      </Button>
    </form>
  );
}

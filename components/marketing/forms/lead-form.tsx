"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitWebsiteEnquiryAction } from "@/lib/actions/enquiry.actions";
import type { LeadFormVariant } from "@/types/marketing";
import { CheckCircle2, Loader2, User, Phone, Mail, Globe, BookOpen, Shield, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsultationTrust } from "@/components/marketing/forms/consultation-trust";

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
  premium?: boolean;
}

const CONSULTATION_STEPS = ["Consult", "Plan", "Apply"] as const;

function FieldIcon({ icon: Icon }: { icon: typeof User }) {
  return <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70" />;
}

const fieldClass =
  "lead-form-field h-11 rounded-xl border-border/80 bg-white text-secondary shadow-sm transition-colors placeholder:text-muted-foreground caret-primary focus-visible:border-primary/40 focus-visible:ring-primary/15";

const fieldClassWithIcon = `${fieldClass} pl-10`;

const textareaClass =
  "lead-form-textarea w-full rounded-xl border border-border/80 bg-white px-4 py-3 text-sm text-secondary shadow-sm outline-none transition-colors placeholder:text-muted-foreground caret-primary focus-visible:border-primary/40 focus-visible:ring-3 focus-visible:ring-primary/15";

export function LeadForm({
  variant = "consultation",
  formPage,
  defaultCountry,
  className,
  compact = false,
  premium = false,
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

  const shellClass = premium ? "consultation-card" : "glass-card";

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(shellClass, "rounded-2xl p-6 text-center", className)}
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
      className={cn(shellClass, "rounded-2xl p-5 md:p-6", className)}
    >
      {premium && (
        <div className="mb-5 border-b border-border/60 pb-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-secondary">Book your FREE Consultation</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {CONSULTATION_STEPS.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span
                  className={cn(
                    "step-indicator",
                    index === 0 && "step-indicator-active"
                  )}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {index + 1}
                  </span>
                  {step}
                </span>
                {index < CONSULTATION_STEPS.length - 1 && (
                  <span className="text-muted-foreground/40">-</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={cn("grid gap-4", compact ? "grid-cols-1" : "md:grid-cols-2")}>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="lead-name" className="text-secondary">
            Full name
          </Label>
          <div className="relative">
            {premium && <FieldIcon icon={User} />}
            <Input
              id="lead-name"
              {...form.register("name")}
              placeholder="Your name"
              className={premium ? fieldClassWithIcon : fieldClass}
            />
          </div>
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lead-phone" className="text-secondary">
            Phone
          </Label>
          <div className="relative">
            {premium && <FieldIcon icon={Phone} />}
            <Input
              id="lead-phone"
              {...form.register("phone")}
              placeholder="10-digit mobile"
              className={premium ? fieldClassWithIcon : fieldClass}
            />
          </div>
          {form.formState.errors.phone && (
            <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lead-email" className="text-secondary">
            Email <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <div className="relative">
            {premium && <FieldIcon icon={Mail} />}
            <Input
              id="lead-email"
              type="email"
              {...form.register("email")}
              placeholder="you@email.com"
              className={premium ? fieldClassWithIcon : fieldClass}
            />
          </div>
        </div>
        {showCountry && (
          <div className="space-y-2">
            <Label htmlFor="lead-country" className="text-secondary">
              Target country
            </Label>
            <div className="relative">
              {premium && <FieldIcon icon={Globe} />}
              <Input
                id="lead-country"
                {...form.register("targetCountry")}
                placeholder="e.g. Canada"
                className={premium ? fieldClassWithIcon : fieldClass}
              />
            </div>
          </div>
        )}
        {showCourse && (
          <div className="space-y-2">
            <Label htmlFor="lead-course" className="text-secondary">
              Course <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <div className="relative">
              {premium && <FieldIcon icon={BookOpen} />}
              <Input
                id="lead-course"
                {...form.register("course")}
                placeholder="e.g. MBA"
                className={premium ? fieldClassWithIcon : fieldClass}
              />
            </div>
          </div>
        )}
        {showLoan && (
          <Controller
            name="loanRequired"
            control={form.control}
            render={({ field }) => {
              const checked = Boolean(field.value);
              return (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => field.onChange(!checked)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      field.onChange(!checked);
                    }
                  }}
                  className={cn(
                    "md:col-span-2 flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-all",
                    checked
                      ? "border-primary/35 bg-primary/[0.06] shadow-sm"
                      : "border-border/80 bg-white/80 hover:border-primary/20 hover:bg-primary/[0.03]"
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => field.onChange(value === true)}
                    onClick={(event) => event.stopPropagation()}
                    className={cn(
                      "mt-0.5 size-5 rounded-md border-2 bg-white shadow-sm",
                      checked
                        ? "border-primary bg-primary text-white"
                        : "border-primary/60 hover:border-primary"
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-medium text-secondary">
                      <Banknote className="h-4 w-4 text-primary" />
                      I need education loan assistance
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                      {checked
                        ? "We will flag this enquiry for loan support and compare lender options with you."
                        : "Leave unchecked if you only need admissions or visa counselling for now."}
                    </span>
                  </span>
                </div>
              );
            }}
          />
        )}
        {showMessage && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="lead-message" className="text-secondary">
              Message <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <textarea
              id="lead-message"
              {...form.register("message")}
              rows={3}
              className={textareaClass}
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

      <Button
        type="submit"
        variant="ghost"
        disabled={isPending}
        className="btn-marketing mt-4 w-full rounded-full hover:bg-transparent"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Book Free Consultation"
        )}
      </Button>

      {premium && <ConsultationTrust />}
    </form>
  );
}

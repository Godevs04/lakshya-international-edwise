"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitWebsiteEnquiryAction } from "@/lib/actions/enquiry.actions";
import { CheckCircle2, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const step1Schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(10, "Enter a valid 10-digit mobile number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
});

const step2Schema = z.object({
  targetCountry: z.string().optional(),
  loanAmount: z.string().optional(),
  currentStatus: z.string().optional(),
  destination: z.string().optional(),
  preferredLender: z.string().optional(),
  message: z.string().optional(),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

const DESTINATIONS = [
  "USA",
  "Canada",
  "UK",
  "Germany",
  "Ireland",
  "Australia",
  "New Zealand",
  "Dubai",
  "Other",
];

const CURRENT_STATUS = [
  "Planning to apply",
  "Received admit",
  "Loan rejected elsewhere",
  "Applied, awaiting decision",
];

const fieldClass =
  "lead-form-field h-11 rounded-xl border-border/80 bg-white text-foreground shadow-sm placeholder:text-muted-foreground";

interface EligibilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferredLender?: string;
  source?: string;
}

export function EligibilityModal({
  open,
  onOpenChange,
  preferredLender,
  source,
}: EligibilityModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const step1 = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: "", phone: "", email: "" },
  });

  const step2 = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      targetCountry: "",
      loanAmount: "",
      currentStatus: "",
      destination: "",
      preferredLender: preferredLender ?? "",
      message: "",
    },
  });

  function reset() {
    setStep(1);
    setSubmitted(false);
    setError(null);
    step1.reset();
    step2.reset({ preferredLender: preferredLender ?? "" });
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      window.setTimeout(reset, 200);
    }
  }

  function goToStep2() {
    setError(null);
    setStep(2);
  }

  function onFinalSubmit(values: Step2Values) {
    setError(null);
    const s1 = step1.getValues();
    const formData = new FormData();
    formData.set("name", s1.name);
    formData.set("phone", s1.phone);
    formData.set("enquiryType", "eligibility");
    formData.set("loanRequired", "true");
    formData.set("formPage", source ?? "eligibility-modal");
    if (s1.email) formData.set("email", s1.email);
    const country = values.destination || values.targetCountry;
    if (country) formData.set("targetCountry", country);
    if (values.loanAmount) formData.set("loanAmount", values.loanAmount);
    if (values.currentStatus) formData.set("currentStatus", values.currentStatus);
    if (values.preferredLender) formData.set("preferredLender", values.preferredLender);
    if (values.message) formData.set("message", values.message);

    startTransition(async () => {
      const result = await submitWebsiteEnquiryAction(formData);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error ?? "Unable to submit. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="marketing-site max-w-lg border-border bg-card text-foreground">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6 text-center"
          >
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">You&apos;re all set!</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Our loan experts will review your details and contact you within one
              business day with the best lender options.
            </p>
            <Button
              onClick={() => handleOpenChange(false)}
              variant="ghost"
              className="btn-marketing mt-5 rounded-full px-6 hover:bg-transparent"
            >
              Done
            </Button>
          </motion.div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Check your loan eligibility</DialogTitle>
              <DialogDescription>
                {step === 1
                  ? "Step 1 of 2 — Tell us how to reach you."
                  : "Step 2 of 2 — A few details about your plans."}
              </DialogDescription>
            </DialogHeader>

            <div className="mb-1 flex items-center gap-2">
              {[1, 2].map((s) => (
                <span
                  key={s}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    step >= s ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                  onSubmit={step1.handleSubmit(goToStep2)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="elig-name">Full name</Label>
                    <Input id="elig-name" {...step1.register("name")} placeholder="Your name" className={fieldClass} />
                    {step1.formState.errors.name && (
                      <p className="text-xs text-destructive">{step1.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="elig-phone">Phone</Label>
                    <Input id="elig-phone" {...step1.register("phone")} placeholder="10-digit mobile" className={fieldClass} />
                    {step1.formState.errors.phone && (
                      <p className="text-xs text-destructive">{step1.formState.errors.phone.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="elig-email">
                      Email <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Input id="elig-email" type="email" {...step1.register("email")} placeholder="you@email.com" className={fieldClass} />
                    {step1.formState.errors.email && (
                      <p className="text-xs text-destructive">{step1.formState.errors.email.message}</p>
                    )}
                  </div>
                  <Button type="submit" variant="ghost" className="btn-marketing w-full rounded-full hover:bg-transparent">
                    Continue
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                  onSubmit={step2.handleSubmit(onFinalSubmit)}
                  className="space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="elig-destination">Destination</Label>
                      <select id="elig-destination" {...step2.register("destination")} className={cn(fieldClass, "w-full px-3")}>
                        <option value="">Select country</option>
                        {DESTINATIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="elig-amount">Loan amount</Label>
                      <Input id="elig-amount" {...step2.register("loanAmount")} placeholder="e.g. ₹40 Lakh" className={fieldClass} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="elig-status">Current status</Label>
                    <select id="elig-status" {...step2.register("currentStatus")} className={cn(fieldClass, "w-full px-3")}>
                      <option value="">Select status</option>
                      {CURRENT_STATUS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="elig-lender">
                      Preferred bank <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Input id="elig-lender" {...step2.register("preferredLender")} placeholder="e.g. SBI, Avanse" className={fieldClass} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="elig-message">
                      Message <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <textarea
                      id="elig-message"
                      {...step2.register("message")}
                      rows={2}
                      placeholder="Anything we should know?"
                      className="lead-form-textarea w-full rounded-xl border border-border/80 bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="rounded-full"
                    >
                      <ArrowLeft className="mr-1.5 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="ghost"
                      disabled={isPending}
                      className="btn-marketing flex-1 rounded-full hover:bg-transparent"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Check Eligibility"
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

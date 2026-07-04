"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitPartnerEnquiryAction } from "@/lib/actions/partner-enquiry.actions";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const partnerFormSchema = z
  .object({
    name: z.string().min(2, "Please enter your name"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().min(10, "Enter a valid 10-digit mobile number"),
    companyName: z.string().min(2, "Company name is required"),
    city: z.string().min(2, "City is required"),
    isOwner: z.enum(["yes", "no"]),
    mobileIsWhatsapp: z.enum(["yes", "no"]),
    whatsapp: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mobileIsWhatsapp === "no") {
      const whatsapp = data.whatsapp?.trim() ?? "";
      if (!whatsapp) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter your WhatsApp number",
          path: ["whatsapp"],
        });
        return;
      }
      if (whatsapp.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid 10-digit WhatsApp number",
          path: ["whatsapp"],
        });
      }
    }
  });

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

const fieldClass =
  "lead-form-field h-11 rounded-xl border-border/80 bg-white text-foreground shadow-sm placeholder:text-muted-foreground";

export function PartnerLeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      companyName: "",
      city: "",
      isOwner: "no",
      mobileIsWhatsapp: "yes",
      whatsapp: "",
    },
  });

  const ownerSelection = useWatch({ control: form.control, name: "isOwner", defaultValue: "no" });
  const mobileIsWhatsappSelection = useWatch({
    control: form.control,
    name: "mobileIsWhatsapp",
    defaultValue: "yes",
  });
  const needsSeparateWhatsapp = mobileIsWhatsappSelection === "no";

  function onSubmit(values: PartnerFormValues) {
    setError(null);
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("email", values.email);
    formData.set("phone", values.phone);
    formData.set("companyName", values.companyName);
    formData.set("city", values.city);
    formData.set("isOwner", values.isOwner === "yes" ? "true" : "false");
    formData.set(
      "mobileIsWhatsapp",
      values.mobileIsWhatsapp === "yes" ? "true" : "false"
    );
    if (values.mobileIsWhatsapp === "no" && values.whatsapp) {
      formData.set("whatsapp", values.whatsapp);
    }

    startTransition(async () => {
      const result = await submitPartnerEnquiryAction(formData);
      if (result.success) {
        setSubmitted(true);
        form.reset();
      } else {
        setError(result.error ?? "Unable to submit. Please try again.");
      }
    });
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="consultation-card rounded-2xl p-8 text-center"
      >
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">Thank you!</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Our partnerships team will reach out to you shortly to discuss how we can grow
          together.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="consultation-card rounded-2xl p-6 md:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="partner-name">Full name</Label>
          <Input id="partner-name" {...form.register("name")} placeholder="Your name" className={fieldClass} />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="partner-email">Email</Label>
          <Input id="partner-email" type="email" {...form.register("email")} placeholder="you@company.com" className={fieldClass} />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="partner-phone">Mobile number</Label>
          <Input id="partner-phone" {...form.register("phone")} placeholder="10-digit mobile" className={fieldClass} />
          {form.formState.errors.phone && (
            <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Is this mobile number also your WhatsApp?</Label>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((value) => {
              const checked = mobileIsWhatsappSelection === value;
              return (
                <label
                  key={value}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition-colors",
                    checked
                      ? "border-primary bg-primary/[0.06] text-primary"
                      : "border-border bg-white text-secondary/80 hover:border-primary/30"
                  )}
                >
                  <input
                    type="radio"
                    value={value}
                    {...form.register("mobileIsWhatsapp")}
                    className="sr-only"
                  />
                  {value}
                </label>
              );
            })}
          </div>
        </div>

        {needsSeparateWhatsapp && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="partner-whatsapp">WhatsApp number</Label>
            <Input
              id="partner-whatsapp"
              {...form.register("whatsapp")}
              placeholder="10-digit WhatsApp number"
              className={fieldClass}
            />
            {form.formState.errors.whatsapp && (
              <p className="text-xs text-destructive">{form.formState.errors.whatsapp.message}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="partner-company">Company registered name</Label>
          <Input id="partner-company" {...form.register("companyName")} placeholder="Your company" className={fieldClass} />
          {form.formState.errors.companyName && (
            <p className="text-xs text-destructive">{form.formState.errors.companyName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="partner-city">City</Label>
          <Input id="partner-city" {...form.register("city")} placeholder="City" className={fieldClass} />
          {form.formState.errors.city && (
            <p className="text-xs text-destructive">{form.formState.errors.city.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Are you the owner or director?</Label>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((value) => {
              const checked = ownerSelection === value;
              return (
                <label
                  key={value}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition-colors",
                    checked
                      ? "border-primary bg-primary/[0.06] text-primary"
                      : "border-border bg-white text-secondary/80 hover:border-primary/30"
                  )}
                >
                  <input
                    type="radio"
                    value={value}
                    {...form.register("isOwner")}
                    className="sr-only"
                  />
                  {value}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        variant="ghost"
        disabled={isPending}
        className="btn-marketing mt-5 w-full rounded-full hover:bg-transparent"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Become a Partner"
        )}
      </Button>
    </form>
  );
}

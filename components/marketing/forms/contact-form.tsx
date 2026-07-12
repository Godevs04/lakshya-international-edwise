"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitWebsiteEnquiryAction } from "@/lib/actions/enquiry.actions";
import { CheckCircle2, Loader2, Send } from "lucide-react";

interface ContactFormProps {
  embedded?: boolean;
}

const contactFormSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(10, "Enter a valid 10-digit mobile number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  subject: z.string().min(2, "Please enter a subject").max(120),
  message: z.string().min(10, "Please enter at least 10 characters"),
  website: z.string().max(0).optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const fieldClass =
  "lead-form-field h-11 rounded-xl border-border/80 bg-white text-foreground shadow-sm placeholder:text-muted-foreground";

export function ContactForm({ embedded = false }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      subject: "",
      message: "",
      website: "",
    },
  });

  function onSubmit(values: ContactFormValues) {
    setError(null);
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("phone", values.phone);
    formData.set("enquiryType", "contact");
    formData.set("formPage", "/contact");
    formData.set("subject", values.subject);
    formData.set("message", values.message);
    if (values.email) formData.set("email", values.email);
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

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={embedded ? "contact-form-success" : "consultation-card rounded-2xl p-8 text-center"}
      >
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">Message sent!</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Thank you for reaching out. Our team will respond within one business day.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={embedded ? "contact-form-embedded" : "consultation-card rounded-2xl p-6 md:p-8"}
    >
      {!embedded ? (
        <>
          <h2 className="text-lg font-semibold text-foreground">Send us a message</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Have a question about education loans, forex, or blocked accounts? Fill in the form
            and we will get back to you shortly.
          </p>
        </>
      ) : null}

      <div className={embedded ? "space-y-4" : "mt-6 space-y-4"}>
        <div className="space-y-2">
          <Label htmlFor="contact-name">Full name</Label>
          <Input
            id="contact-name"
            {...form.register("name")}
            placeholder="Your name"
            className={fieldClass}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-phone">Mobile number</Label>
            <Input
              id="contact-phone"
              {...form.register("phone")}
              placeholder="10-digit mobile"
              className={fieldClass}
            />
            {form.formState.errors.phone && (
              <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">
              Email <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="contact-email"
              type="email"
              {...form.register("email")}
              placeholder="you@email.com"
              className={fieldClass}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-subject">Subject</Label>
          <Input
            id="contact-subject"
            {...form.register("subject")}
            placeholder="e.g. Education loan for USA"
            className={fieldClass}
          />
          {form.formState.errors.subject && (
            <p className="text-xs text-destructive">{form.formState.errors.subject.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-message">Message</Label>
          <textarea
            id="contact-message"
            {...form.register("message")}
            rows={4}
            placeholder="Tell us how we can help you..."
            className="lead-form-textarea w-full rounded-xl border border-border/80 bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground"
          />
          {form.formState.errors.message && (
            <p className="text-xs text-destructive">{form.formState.errors.message.message}</p>
          )}
        </div>

        <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...form.register("website")} />
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
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send message
          </>
        )}
      </Button>
    </form>
  );
}

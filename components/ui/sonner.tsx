"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { Check, Info, AlertTriangle, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand={false}
      visibleToasts={3}
      gap={10}
      offset={24}
      duration={3800}
      closeButton
      icons={{
        success: <Check className="size-3.5 stroke-[2]" />,
        info: <Info className="size-3.5 stroke-[2]" />,
        warning: <AlertTriangle className="size-3.5 stroke-[2]" />,
        error: <X className="size-3.5 stroke-[2]" />,
        loading: <Loader2 className="size-3.5 animate-spin stroke-[2]" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: cn(
            "cn-toast group/toast relative flex w-[min(100vw-2rem,300px)] items-start gap-3",
            "rounded-lg border border-[#E8E4DC] bg-white px-4 pb-3.5 pt-4 pr-9",
            "shadow-[0_2px_8px_rgba(11,31,58,0.04),0_8px_24px_rgba(11,31,58,0.06)]",
            "dark:border-white/[0.08] dark:bg-[#0f1729]",
            "dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
            "data-[swipe=move]:transition-none"
          ),
          title: cn(
            "text-[13px] font-medium leading-snug text-[#0B1F3A]",
            "dark:text-slate-100"
          ),
          description: cn(
            "mt-0.5 text-[12px] leading-relaxed text-[#64748B]",
            "dark:text-slate-400"
          ),
          content: "flex min-w-0 flex-1 flex-col gap-0.5",
          icon: "mt-0.5 shrink-0",
          closeButton: cn(
            "absolute right-2 top-2 flex size-5 items-center justify-center",
            "text-[#CBD5E1] transition-colors",
            "hover:text-[#94A3B8] dark:hover:text-slate-400"
          ),
          actionButton: cn(
            "mt-2 rounded bg-[#0B1F3A] px-3 py-1",
            "text-[10px] font-medium uppercase tracking-wide text-white",
            "hover:bg-[#1E3A5F]"
          ),
          cancelButton: cn(
            "mt-2 rounded border border-[#E5E7EB] px-3 py-1",
            "text-[10px] font-medium text-[#64748B]",
            "hover:bg-slate-50 dark:border-white/10"
          ),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

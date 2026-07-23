"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkStudentPhoneAction } from "@/lib/actions/student.actions";
import {
  INDIAN_PHONE_DIGITS,
  isValidIndianPhone,
  normalizeDigits,
  normalizeIndianPhone,
} from "@/lib/validations/indian-fields";
import { cn } from "@/lib/utils";

const PHONE_HINT = "10-digit Indian mobile (starts with 6–9). +91 prefix optional.";
const CHECK_DEBOUNCE_MS = 350;

interface RemotePhoneCheck {
  phone: string;
  available: boolean;
  message: string;
  matchHref: string | null;
  matchLabel: string | null;
}

interface StudentPhoneFieldProps {
  id?: string;
  name?: string;
  label?: string;
  required?: boolean;
  defaultValue?: string;
  excludeStudentId?: string;
  className?: string;
  /** When true, blocks form submit while taken/invalid/checking for a complete number */
  blockSubmitWhenUnavailable?: boolean;
  onAvailabilityChange?: (available: boolean) => void;
}

export function StudentPhoneField({
  id,
  name = "phone",
  label = "Phone Number",
  required = false,
  defaultValue = "",
  excludeStudentId,
  className,
  blockSubmitWhenUnavailable = true,
  onAvailabilityChange,
}: StudentPhoneFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const onAvailabilityChangeRef = useRef(onAvailabilityChange);
  const [value, setValue] = useState(defaultValue);
  const [remote, setRemote] = useState<RemotePhoneCheck | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    onAvailabilityChangeRef.current = onAvailabilityChange;
  }, [onAvailabilityChange]);

  const normalized = normalizeIndianPhone(value);
  const digitCount = normalizeDigits(value).length;
  const hasCompleteDigits = digitCount >= INDIAN_PHONE_DIGITS;
  const isLocallyInvalid = hasCompleteDigits && !isValidIndianPhone(normalized);
  const checkPhone = hasCompleteDigits && isValidIndianPhone(normalized) ? normalized : null;

  const status = useMemo(() => {
    if (!value.trim() || !hasCompleteDigits) return "idle" as const;
    if (isLocallyInvalid) return "invalid" as const;
    if (!checkPhone) return "idle" as const;
    if (!remote || remote.phone !== checkPhone || isPending) return "checking" as const;
    return remote.available ? ("available" as const) : ("taken" as const);
  }, [value, hasCompleteDigits, isLocallyInvalid, checkPhone, remote, isPending]);

  const message = useMemo(() => {
    if (status === "invalid") {
      return "Enter a valid 10-digit Indian mobile number (starts with 6–9).";
    }
    if (status === "checking") {
      return "Checking if this lead already exists…";
    }
    if (remote && checkPhone && remote.phone === checkPhone) {
      return remote.message;
    }
    return "";
  }, [status, remote, checkPhone]);

  const matchHref =
    status === "taken" && remote?.phone === checkPhone ? remote.matchHref : null;
  const matchLabel =
    status === "taken" && remote?.phone === checkPhone ? remote.matchLabel : null;

  useEffect(() => {
    onAvailabilityChangeRef.current?.(
      status === "idle" || status === "available"
    );
  }, [status]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input || !blockSubmitWhenUnavailable) return;

    if (status === "taken" || status === "invalid") {
      input.setCustomValidity(message || "Invalid phone number");
    } else if (status === "checking") {
      input.setCustomValidity("Checking whether this phone number already exists…");
    } else {
      input.setCustomValidity("");
    }
  }, [status, message, blockSubmitWhenUnavailable]);

  useEffect(() => {
    if (!checkPhone) return;

    const timer = window.setTimeout(() => {
      startTransition(async () => {
        const result = await checkStudentPhoneAction(checkPhone, excludeStudentId);
        if (!result.success || !result.data) {
          setRemote({
            phone: checkPhone,
            available: true,
            message: result.error ?? "Unable to verify phone number right now.",
            matchHref: null,
            matchLabel: null,
          });
          return;
        }

        setRemote({
          phone: checkPhone,
          available: result.data.available,
          message: result.data.message,
          matchHref: result.data.match?.href ?? null,
          matchLabel: result.data.match
            ? `${result.data.match.firstName} ${result.data.match.lastName}`.trim() ||
              result.data.match.studentId
            : null,
        });
      });
    }, CHECK_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [checkPhone, excludeStudentId]);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={inputId}>
        {label}
        {required ? " *" : ""}
      </Label>
      <Input
        ref={inputRef}
        id={inputId}
        name={name}
        type="tel"
        inputMode="numeric"
        maxLength={13}
        placeholder="9363047040"
        required={required}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-invalid={status === "taken" || status === "invalid" || undefined}
        aria-describedby={`${inputId}-hint`}
      />
      <div id={`${inputId}-hint`} className="space-y-1">
        <p className="text-xs text-muted-foreground">{PHONE_HINT}</p>
        {status === "checking" ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            {message}
          </p>
        ) : null}
        {status === "available" ? (
          <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            {message}
          </p>
        ) : null}
        {status === "invalid" || status === "taken" ? (
          <p className="flex items-start gap-1.5 text-xs font-medium text-destructive">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              {message}
              {matchHref ? (
                <>
                  {" "}
                  <Link href={matchHref} className="underline underline-offset-2">
                    Open {matchLabel ?? "existing lead"}
                  </Link>
                </>
              ) : null}
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

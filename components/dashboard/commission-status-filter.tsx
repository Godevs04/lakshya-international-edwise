"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COMMISSION_STATUS_FILTER_OPTIONS } from "@/lib/constants/commission-status";

interface CommissionStatusFilterProps {
  label?: string;
}

export function CommissionStatusFilter({ label = "Commission status" }: CommissionStatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") ?? "all";

  function handleChange(value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      next.delete("status");
    } else {
      next.set("status", value);
    }
    const query = next.toString();
    router.push(query ? `?${query}` : "?");
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Select value={current} onValueChange={handleChange}>
        <SelectTrigger className="w-full min-w-[220px] max-w-sm">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          {COMMISSION_STATUS_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

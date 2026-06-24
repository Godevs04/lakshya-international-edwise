"use client";

import { Button } from "@/components/ui/button";
import { BankFormSheet } from "@/components/dashboard/bank-form-sheet";
import { Building2 } from "lucide-react";

export function AddBankSheet() {
  return (
    <BankFormSheet
      trigger={
        <Button size="sm">
          <Building2 className="mr-1.5 h-4 w-4" />
          Add Bank
        </Button>
      }
    />
  );
}

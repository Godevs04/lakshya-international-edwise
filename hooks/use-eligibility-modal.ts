"use client";

import { useContext } from "react";
import { EligibilityModalContext } from "@/components/marketing/eligibility/eligibility-modal-context";

export function useEligibilityModal() {
  const context = useContext(EligibilityModalContext);
  if (!context) {
    throw new Error(
      "useEligibilityModal must be used within an EligibilityModalProvider"
    );
  }
  return context;
}

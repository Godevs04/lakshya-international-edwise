"use client";

import { createContext } from "react";

export interface EligibilityModalOptions {
  preferredLender?: string;
  targetCountry?: string;
  source?: string;
}

export interface EligibilityModalContextValue {
  open: (options?: EligibilityModalOptions) => void;
  close: () => void;
  isOpen: boolean;
}

export const EligibilityModalContext =
  createContext<EligibilityModalContextValue | null>(null);

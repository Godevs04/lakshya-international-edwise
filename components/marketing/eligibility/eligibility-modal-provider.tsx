"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  EligibilityModalContext,
  type EligibilityModalOptions,
} from "@/components/marketing/eligibility/eligibility-modal-context";
import { EligibilityModal } from "@/components/marketing/eligibility/eligibility-modal";

export function EligibilityModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<EligibilityModalOptions>({});
  const optionsRef = useRef<EligibilityModalOptions>({});

  const open = useCallback((next?: EligibilityModalOptions) => {
    optionsRef.current = next ?? {};
    setOptions(next ?? {});
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <EligibilityModalContext.Provider value={value}>
      {children}
      <EligibilityModal
        open={isOpen}
        onOpenChange={setIsOpen}
        preferredLender={options.preferredLender}
        source={options.source}
      />
    </EligibilityModalContext.Provider>
  );
}

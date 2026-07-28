"use client";

import { useId, useState } from "react";
import { ChevronDown, ClipboardList } from "lucide-react";
import type { EducationLoanChecklistGroup } from "@/lib/constants/marketing/education-loan-options";
import { cn } from "@/lib/utils";

interface DocumentChecklistAccordionProps {
  title: string;
  description: string;
  groups: EducationLoanChecklistGroup[];
  className?: string;
  headClassName?: string;
  variant?: "loan-type" | "country";
}

export function DocumentChecklistAccordion({
  title,
  description,
  groups,
  className,
  headClassName,
  variant = "loan-type",
}: DocumentChecklistAccordionProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState(0);
  const prefix = variant === "country" ? "country-loan-type-checklist" : "loan-type-checklist";

  return (
    <div className={cn(prefix, className)}>
      <div className={cn(`${prefix}-head`, headClassName)}>
        <ClipboardList className="h-5 w-5 text-primary" aria-hidden />
        <div>
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
      </div>

      <div className={`${prefix}-accordion`}>
        {groups.map((group, index) => {
          const panelId = `${baseId}-panel-${index}`;
          const buttonId = `${baseId}-trigger-${index}`;
          const isOpen = openIndex === index;

          return (
            <div key={group.title} className={cn(`${prefix}-accordion-item`, isOpen && "is-open")}>
              <button
                type="button"
                id={buttonId}
                className={`${prefix}-accordion-trigger`}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
              >
                <span className={`${prefix}-accordion-title`}>{group.title}</span>
                <span className={`${prefix}-accordion-action`}>
                  {isOpen ? "Show less" : "Read more"}
                  <ChevronDown
                    className={cn(
                      "inline-block h-3.5 w-3.5 shrink-0 transition-transform duration-300",
                      isOpen && "rotate-180"
                    )}
                    aria-hidden
                  />
                </span>
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={`${prefix}-accordion-panel`}
                hidden={!isOpen}
              >
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

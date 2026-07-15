import { cn } from "@/lib/utils";

const SECTION_HEADINGS = new Set([
  "Collateral Education Loan (ROI from 8.25%)",
  "Non-Collateral Education Loan (ROI from 10.5%)",
  "Non-Co-Signer Education Loan",
]);

function isBulletBlock(block: string) {
  return block
    .split("\n")
    .filter(Boolean)
    .every((line) => line.trimStart().startsWith("• "));
}

interface FaqAnswerProps {
  answer: string;
  className?: string;
}

export function FaqAnswer({ answer, className }: FaqAnswerProps) {
  const blocks = answer
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className={cn("faq-answer space-y-3 text-sm leading-relaxed text-muted-foreground", className)}>
      {blocks.map((block, index) => {
        if (isBulletBlock(block)) {
          const items = block
            .split("\n")
            .map((line) => line.replace(/^•\s*/, "").trim())
            .filter(Boolean);

          return (
            <ul key={`list-${index}`} className="faq-answer-list">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        if (SECTION_HEADINGS.has(block)) {
          return (
            <p key={`heading-${index}`} className="faq-answer-heading">
              {block}
            </p>
          );
        }

        return <p key={`para-${index}`}>{block}</p>;
      })}
    </div>
  );
}

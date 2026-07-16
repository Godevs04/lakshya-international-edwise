import { cn } from "@/lib/utils";

function isBulletBlock(block: string) {
  return block
    .split("\n")
    .filter(Boolean)
    .every((line) => line.trimStart().startsWith("• "));
}

function isHeading(block: string) {
  return block.startsWith("## ") || block.startsWith("### ");
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

        if (isHeading(block)) {
          const isSub = block.startsWith("### ");
          const text = block.replace(/^#{2,3}\s+/, "");
          return (
            <p
              key={`heading-${index}`}
              className={isSub ? "faq-answer-subheading" : "faq-answer-heading"}
            >
              {text}
            </p>
          );
        }

        return <p key={`para-${index}`}>{block}</p>;
      })}
    </div>
  );
}

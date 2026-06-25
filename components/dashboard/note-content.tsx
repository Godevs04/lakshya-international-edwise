import { splitNoteContentWithMentions } from "@/lib/utils/note-mentions";

export function NoteContent({ content }: { content: string }) {
  const parts = splitNoteContentWithMentions(content);

  return (
    <p className="text-sm whitespace-pre-wrap">
      {parts.map((part, index) =>
        part.type === "mention" ? (
          <span
            key={`${part.value}-${index}`}
            className="rounded-md bg-[#6D5EF7]/10 px-1 font-medium text-[#6D5EF7]"
          >
            {part.value}
          </span>
        ) : (
          <span key={`${part.value}-${index}`}>{part.value}</span>
        )
      )}
    </p>
  );
}

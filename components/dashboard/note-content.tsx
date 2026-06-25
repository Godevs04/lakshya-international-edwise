import { splitNoteContentWithMentions, type MentionUser } from "@/lib/utils/note-mentions";

export function NoteContent({
  content,
  teamUsers = [],
}: {
  content: string;
  teamUsers?: MentionUser[];
}) {
  const parts = splitNoteContentWithMentions(content, teamUsers);

  return (
    <p className="text-sm whitespace-pre-wrap">
      {parts.map((part, index) =>
        part.type === "mention" ? (
          <span
            key={`${part.value}-${index}`}
            className="rounded-md bg-[#E8952E]/10 px-1 font-medium text-[#E8952E]"
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

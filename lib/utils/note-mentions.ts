export interface MentionUser {
  _id: string;
  name: string;
}

const MENTION_TOKEN = /(^|[\s.,;:!?()[\]{}])@([^\s@][^\n@]*?)(?=$|[\s.,;:!?()[\]{}])/g;

export function buildMentionToken(name: string): string {
  return `@${name.trim()}`;
}

export function resolveMentionedUserIds(
  content: string,
  teamUsers: MentionUser[],
  explicitIds: string[] = []
): string[] {
  const ids = new Set(explicitIds.filter(Boolean));
  const normalizedUsers = teamUsers.map((user) => ({
    id: user._id,
    name: user.name.trim(),
    lower: user.name.trim().toLowerCase(),
  }));

  let match: RegExpExecArray | null;
  const pattern = new RegExp(MENTION_TOKEN.source, "g");
  while ((match = pattern.exec(content)) !== null) {
    const mentionText = match[2]?.trim().toLowerCase();
    if (!mentionText) continue;

    const exact = normalizedUsers.find((user) => user.lower === mentionText);
    if (exact) {
      ids.add(exact.id);
      continue;
    }

    const prefixMatches = normalizedUsers.filter((user) =>
      user.lower.startsWith(mentionText)
    );
    if (prefixMatches.length === 1) {
      ids.add(prefixMatches[0].id);
    }
  }

  return [...ids];
}

export function splitNoteContentWithMentions(content: string): Array<{ type: "text" | "mention"; value: string }> {
  const parts: Array<{ type: "text" | "mention"; value: string }> = [];
  let lastIndex = 0;

  const pattern = new RegExp(MENTION_TOKEN.source, "g");
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    const mentionStart = match.index + match[1].length;
    const mentionText = `@${match[2]}`;

    if (mentionStart > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, mentionStart) });
    }

    parts.push({ type: "mention", value: mentionText });
    lastIndex = mentionStart + mentionText.length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", value: content }];
}

export interface MentionUser {
  _id: string;
  name: string;
}

const MENTION_BOUNDARY = /[\s.,;:!?()[\]{}]/;

interface MentionSpan {
  start: number;
  end: number;
  text: string;
  userId?: string;
}

function isMentionBoundary(char: string | undefined): boolean {
  return char === undefined || MENTION_BOUNDARY.test(char);
}

function findMentionSpans(content: string, teamUsers: MentionUser[] = []): MentionSpan[] {
  const spans: MentionSpan[] = [];
  const sortedUsers = [...teamUsers]
    .filter((user) => user.name.trim())
    .sort((a, b) => b.name.trim().length - a.name.trim().length);

  let index = 0;
  while (index < content.length) {
    const atIndex = content.indexOf("@", index);
    if (atIndex < 0) break;

    const previous = atIndex > 0 ? content[atIndex - 1] : "";
    if (atIndex > 0 && !isMentionBoundary(previous)) {
      index = atIndex + 1;
      continue;
    }

    const afterAt = content.slice(atIndex + 1);
    let matched = false;

    for (const user of sortedUsers) {
      const name = user.name.trim();
      if (!name) continue;

      if (!afterAt.toLowerCase().startsWith(name.toLowerCase())) continue;

      const end = atIndex + 1 + name.length;
      if (!isMentionBoundary(content[end])) continue;

      spans.push({
        start: atIndex,
        end,
        text: content.slice(atIndex, end),
        userId: user._id,
      });
      index = end;
      matched = true;
      break;
    }

    if (matched) continue;

    const fallback = afterAt.match(/^([^\s@][^\n@]*?)(?=$|[\s.,;:!?()[\]{}])/);
    if (fallback?.[1]) {
      const mentionText = `@${fallback[1]}`;
      spans.push({
        start: atIndex,
        end: atIndex + mentionText.length,
        text: mentionText,
      });
      index = atIndex + mentionText.length;
      continue;
    }

    index = atIndex + 1;
  }

  return spans;
}

export function buildMentionToken(name: string): string {
  return `@${name.trim()}`;
}

export function resolveMentionedUserIds(
  content: string,
  teamUsers: MentionUser[],
  explicitIds: string[] = []
): string[] {
  const ids = new Set(explicitIds.filter(Boolean));

  for (const span of findMentionSpans(content, teamUsers)) {
    if (span.userId) {
      ids.add(span.userId);
      continue;
    }

    const mentionText = span.text.slice(1).trim().toLowerCase();
    if (!mentionText) continue;

    const exact = teamUsers.find((user) => user.name.trim().toLowerCase() === mentionText);
    if (exact) {
      ids.add(exact._id);
      continue;
    }

    const prefixMatches = teamUsers.filter((user) =>
      user.name.trim().toLowerCase().startsWith(mentionText)
    );
    if (prefixMatches.length === 1) {
      ids.add(prefixMatches[0]._id);
    }
  }

  return [...ids];
}

export function splitNoteContentWithMentions(
  content: string,
  teamUsers: MentionUser[] = []
): Array<{ type: "text" | "mention"; value: string }> {
  const spans = findMentionSpans(content, teamUsers);
  if (spans.length === 0) {
    return [{ type: "text", value: content }];
  }

  const parts: Array<{ type: "text" | "mention"; value: string }> = [];
  let lastIndex = 0;

  for (const span of spans) {
    if (span.start > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, span.start) });
    }
    parts.push({ type: "mention", value: span.text });
    lastIndex = span.end;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }

  return parts;
}

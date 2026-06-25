"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { buildMentionToken, type MentionUser } from "@/lib/utils/note-mentions";

interface NoteMentionInputProps {
  name?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  teamUsers: MentionUser[];
  onMentionedIdsChange?: (ids: string[]) => void;
}

function parseMentionQuery(value: string, cursor: number): { query: string; start: number } | null {
  const beforeCursor = value.slice(0, cursor);
  const atIndex = beforeCursor.lastIndexOf("@");
  if (atIndex < 0) return null;

  const between = beforeCursor.slice(atIndex + 1);
  if (between.includes("\n") || /\s{2,}/.test(between)) return null;

  return { query: between, start: atIndex };
}

const MENU_GAP = 6;
const MENU_MAX_HEIGHT = 220;

export function NoteMentionInput({
  name = "content",
  placeholder = "Add a note... Use @ to tag a teammate",
  required,
  className,
  teamUsers,
  onMentionedIdsChange,
}: NoteMentionInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState("");
  const [mentionedIds, setMentionedIds] = useState<string[]>([]);
  const [mentionQuery, setMentionQuery] = useState<{ query: string; start: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({ visibility: "hidden" });

  const suggestions = useMemo(() => {
    if (!mentionQuery) return [];
    const query = mentionQuery.query.trim().toLowerCase();
    return teamUsers
      .filter((user) => !query || user.name.toLowerCase().includes(query))
      .slice(0, 6);
  }, [mentionQuery, teamUsers]);

  const showMenu = Boolean(mentionQuery && suggestions.length > 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!showMenu) return;

    function updatePosition() {
      const input = inputRef.current;
      if (!input) return;

      const rect = input.getBoundingClientRect();
      const estimatedHeight = Math.min(suggestions.length * 40 + 8, MENU_MAX_HEIGHT);
      const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP;
      const spaceAbove = rect.top - MENU_GAP;
      const openAbove = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

      setMenuStyle({
        position: "fixed",
        left: rect.left,
        width: Math.max(rect.width, 200),
        maxHeight: MENU_MAX_HEIGHT,
        zIndex: 9999,
        visibility: "visible",
        ...(openAbove
          ? { bottom: window.innerHeight - rect.top + MENU_GAP }
          : { top: rect.bottom + MENU_GAP }),
      });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showMenu, suggestions.length, mentionQuery?.query]);

  function updateMentionedIds(nextValue: string, ids: string[]) {
    const resolved = new Set(ids);
    for (const user of teamUsers) {
      if (nextValue.includes(buildMentionToken(user.name))) {
        resolved.add(user._id);
      }
    }
    const nextIds = [...resolved];
    setMentionedIds(nextIds);
    onMentionedIdsChange?.(nextIds);
  }

  function handleChange(nextValue: string) {
    setValue(nextValue);
    updateMentionedIds(nextValue, mentionedIds);

    const cursor = inputRef.current?.selectionStart ?? nextValue.length;
    const query = parseMentionQuery(nextValue, cursor);
    setMentionQuery(query);
    setActiveIndex(0);
  }

  function insertMention(user: MentionUser) {
    if (!mentionQuery) return;

    const cursor = inputRef.current?.selectionStart ?? value.length;
    const before = value.slice(0, mentionQuery.start);
    const after = value.slice(cursor);
    const token = `${buildMentionToken(user.name)} `;
    const nextValue = `${before}${token}${after}`;

    setValue(nextValue);
    updateMentionedIds(nextValue, [...mentionedIds, user._id]);
    setMentionQuery(null);
    setActiveIndex(0);

    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      const nextCursor = before.length + token.length;
      input.focus();
      input.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!mentionQuery || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      return;
    }

    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insertMention(suggestions[activeIndex]);
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setMentionQuery(null);
    }
  }

  const mentionMenu =
    mounted && showMenu ? (
      <div
        role="listbox"
        aria-label="Mention teammates"
        style={menuStyle}
        className="overflow-y-auto rounded-xl border border-border bg-popover shadow-lg"
      >
        {suggestions.map((user, index) => (
          <button
            key={user._id}
            type="button"
            role="option"
            aria-selected={index === activeIndex}
            className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors ${
              index === activeIndex ? "bg-primary/10 text-foreground" : "hover:bg-muted/60"
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              insertMention(user);
            }}
          >
            <span className="font-medium">{user.name}</span>
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div className={`relative min-w-0 flex-1 ${className ?? ""}`}>
      <Input
        ref={inputRef}
        name={name}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onClick={(e) => handleChange(e.currentTarget.value)}
        onKeyUp={(e) => handleChange(e.currentTarget.value)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      <input type="hidden" name="mentionedUserIds" value={JSON.stringify(mentionedIds)} />
      {mentionMenu ? createPortal(mentionMenu, document.body) : null}
    </div>
  );
}

"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
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

interface MentionMenuPortalProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  open: boolean;
  suggestions: MentionUser[];
  activeIndex: number;
  onSelect: (user: MentionUser) => void;
}

function MentionMenuPortal({
  inputRef,
  open,
  suggestions,
  activeIndex,
  onSelect,
}: MentionMenuPortalProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) return;

    function updatePosition() {
      const input = inputRef.current;
      const menu = menuRef.current;
      if (!input || !menu) return;

      const rect = input.getBoundingClientRect();
      const estimatedHeight = Math.min(suggestions.length * 40 + 8, MENU_MAX_HEIGHT);
      const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP;
      const spaceAbove = rect.top - MENU_GAP;
      const openAbove = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

      menu.style.position = "fixed";
      menu.style.left = `${rect.left}px`;
      menu.style.width = `${Math.max(rect.width, 200)}px`;
      menu.style.maxHeight = `${MENU_MAX_HEIGHT}px`;
      menu.style.zIndex = "9999";
      menu.style.visibility = "visible";
      menu.style.top = "";
      menu.style.bottom = "";

      if (openAbove) {
        menu.style.bottom = `${window.innerHeight - rect.top + MENU_GAP}px`;
      } else {
        menu.style.top = `${rect.bottom + MENU_GAP}px`;
      }
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, suggestions.length, inputRef]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={menuRef}
      role="listbox"
      aria-label="Mention teammates"
      className="overflow-y-auto rounded-xl border border-border bg-popover shadow-lg"
      style={{ visibility: "hidden" }}
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
            onSelect(user);
          }}
        >
          <span className="font-medium">{user.name}</span>
        </button>
      ))}
    </div>,
    document.body
  );
}

export function NoteMentionInput({
  name = "content",
  placeholder = "Add a note... Use @ to tag a teammate",
  required,
  className,
  teamUsers,
  onMentionedIdsChange,
}: NoteMentionInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [mentionedIds, setMentionedIds] = useState<string[]>([]);
  const [mentionQuery, setMentionQuery] = useState<{ query: string; start: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const suggestions = useMemo(() => {
    if (!mentionQuery) return [];
    const query = mentionQuery.query.trim().toLowerCase();
    return teamUsers
      .filter((user) => !query || user.name.toLowerCase().includes(query))
      .slice(0, 6);
  }, [mentionQuery, teamUsers]);

  const showMenu = Boolean(mentionQuery && suggestions.length > 0);

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
      <MentionMenuPortal
        inputRef={inputRef}
        open={showMenu}
        suggestions={suggestions}
        activeIndex={activeIndex}
        onSelect={insertMention}
      />
    </div>
  );
}

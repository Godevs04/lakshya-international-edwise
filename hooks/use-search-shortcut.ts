"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getSearchShortcutLabel,
  isSearchShortcut,
} from "@/lib/utils/search-shortcut";

const SERVER_SEARCH_SHORTCUT_LABEL = "Ctrl+K";

function subscribeToSearchShortcutLabel(): () => void {
  return () => {};
}

export function useSearchShortcutLabel(): string {
  return useSyncExternalStore(
    subscribeToSearchShortcutLabel,
    getSearchShortcutLabel,
    () => SERVER_SEARCH_SHORTCUT_LABEL
  );
}

export function useSearchShortcutToggle(
  open: boolean,
  onOpenChange: (open: boolean) => void
): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isSearchShortcut(event)) return;
      event.preventDefault();
      onOpenChange(!open);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);
}

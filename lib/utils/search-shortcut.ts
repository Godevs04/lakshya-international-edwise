export function isMacLikePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isSearchShortcut(event: KeyboardEvent): boolean {
  if (!event?.key) return false;
  return event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
}

export function getSearchShortcutLabel(): string {
  return isMacLikePlatform() ? "⌘K" : "Ctrl+K";
}

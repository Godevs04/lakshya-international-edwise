import { describe, expect, it } from "vitest";
import { isSearchShortcut } from "@/lib/utils/search-shortcut";

describe("isSearchShortcut", () => {
  it("matches Cmd+K on Mac", () => {
    expect(
      isSearchShortcut({ key: "k", metaKey: true, ctrlKey: false } as KeyboardEvent)
    ).toBe(true);
  });

  it("matches Ctrl+K on Windows", () => {
    expect(
      isSearchShortcut({ key: "K", metaKey: false, ctrlKey: true } as KeyboardEvent)
    ).toBe(true);
  });

  it("ignores K without modifier", () => {
    expect(
      isSearchShortcut({ key: "k", metaKey: false, ctrlKey: false } as KeyboardEvent)
    ).toBe(false);
  });

  it("ignores events without a key", () => {
    expect(isSearchShortcut({} as KeyboardEvent)).toBe(false);
    expect(isSearchShortcut({ key: undefined } as KeyboardEvent)).toBe(false);
  });
});

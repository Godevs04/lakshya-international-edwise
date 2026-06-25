import { describe, expect, it } from "vitest";
import {
  buildMentionToken,
  resolveMentionedUserIds,
  splitNoteContentWithMentions,
} from "@/lib/utils/note-mentions";

const teamUsers = [
  { _id: "1", name: "Prassana" },
  { _id: "2", name: "Ganesh Auxillo" },
  { _id: "3", name: "Nandini Tegada" },
];

describe("note mentions", () => {
  it("builds mention tokens", () => {
    expect(buildMentionToken("Prassana")).toBe("@Prassana");
    expect(buildMentionToken("Nandini Tegada")).toBe("@Nandini Tegada");
  });

  it("resolves exact and explicit mentions", () => {
    const content = "Please check with @Prassana and update notes";
    expect(resolveMentionedUserIds(content, teamUsers, ["2"])).toEqual(["2", "1"]);
  });

  it("resolves multi-word display names", () => {
    const content = "@Nandini Tegada Testwed";
    expect(resolveMentionedUserIds(content, teamUsers)).toEqual(["3"]);
  });

  it("splits note content into mention parts", () => {
    expect(splitNoteContentWithMentions("Hi @Prassana, please follow up")).toEqual([
      { type: "text", value: "Hi " },
      { type: "mention", value: "@Prassana" },
      { type: "text", value: ", please follow up" },
    ]);
  });

  it("splits full multi-word names into one mention tag", () => {
    expect(splitNoteContentWithMentions("@Nandini Tegada Testwed", teamUsers)).toEqual([
      { type: "mention", value: "@Nandini Tegada" },
      { type: "text", value: " Testwed" },
    ]);
  });
});

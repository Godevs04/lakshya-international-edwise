import { describe, expect, it } from "vitest";
import {
  buildMentionToken,
  resolveMentionedUserIds,
  splitNoteContentWithMentions,
} from "@/lib/utils/note-mentions";

const teamUsers = [
  { _id: "1", name: "Prassana" },
  { _id: "2", name: "Ganesh Auxillo" },
];

describe("note mentions", () => {
  it("builds mention tokens", () => {
    expect(buildMentionToken("Prassana")).toBe("@Prassana");
  });

  it("resolves exact and explicit mentions", () => {
    const content = "Please check with @Prassana and update notes";
    expect(resolveMentionedUserIds(content, teamUsers, ["2"])).toEqual(["2", "1"]);
  });

  it("splits note content into mention parts", () => {
    expect(splitNoteContentWithMentions("Hi @Prassana, please follow up")).toEqual([
      { type: "text", value: "Hi " },
      { type: "mention", value: "@Prassana" },
      { type: "text", value: ", please follow up" },
    ]);
  });
});

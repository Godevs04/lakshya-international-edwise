import { describe, expect, it } from "vitest";
import { mergeMongoFilter } from "@/lib/utils/mongo-filter";

describe("mergeMongoFilter", () => {
  it("merges base filters with additional and clauses", () => {
    const filter = mergeMongoFilter(
      { status: "new" },
      { $or: [{ firstName: /a/i }] },
      { assignedTo: "user-1" }
    );

    expect(filter).toEqual({
      $and: [{ status: "new" }, { $or: [{ firstName: /a/i }] }, { assignedTo: "user-1" }],
    });
  });
});

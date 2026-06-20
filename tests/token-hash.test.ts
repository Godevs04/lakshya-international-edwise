import { describe, expect, it } from "vitest";
import { hashToken } from "@/lib/utils/token-hash";

describe("token-hash", () => {
  it("returns a stable sha256 hex digest", () => {
    const first = hashToken("reset-token-123");
    const second = hashToken("reset-token-123");
    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it("returns different hashes for different tokens", () => {
    expect(hashToken("token-a")).not.toBe(hashToken("token-b"));
  });
});

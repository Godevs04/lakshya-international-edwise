import { describe, it, expect, afterEach } from "vitest";
import { isNextBuildPhase } from "@/lib/config/build-phase";

describe("build-phase", () => {
  const originalPhase = process.env.NEXT_PHASE;

  afterEach(() => {
    if (originalPhase === undefined) {
      delete process.env.NEXT_PHASE;
    } else {
      process.env.NEXT_PHASE = originalPhase;
    }
  });

  it("detects Next.js production build phase", () => {
    process.env.NEXT_PHASE = "phase-production-build";
    expect(isNextBuildPhase()).toBe(true);
  });

  it("returns false outside build phase", () => {
    delete process.env.NEXT_PHASE;
    expect(isNextBuildPhase()).toBe(false);
  });
});

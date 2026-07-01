import { describe, expect, it } from "vitest";
import { computeReadingTimeMinutes } from "@/lib/blog/index";

describe("blog reading time", () => {
  it("computes at least 1 minute for short content", () => {
    expect(computeReadingTimeMinutes("hello world")).toBe(1);
  });

  it("computes reading time from word count", () => {
    const words = Array.from({ length: 400 }, () => "word").join(" ");
    expect(computeReadingTimeMinutes(words)).toBe(2);
  });
});

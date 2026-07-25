import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("next.config redirects", () => {
  const configSource = readFileSync(resolve(process.cwd(), "next.config.ts"), "utf8");
  const compact = configSource.replace(/\s+/g, " ");

  it("redirects legacy admissions routes to finance pages", () => {
    expect(compact).not.toContain('source: "/about", destination: "/#about"');
    expect(compact).toContain(
      'source: "/education-loans", destination: "/services/education-loan"'
    );
    expect(compact).toContain('source: "/blog"');
    expect(compact).toContain('source: "/success-stories", destination: "/#testimonials"');
    expect(compact).toContain(
      'source: "/services/study-abroad", destination: "/services/education-loan"'
    );
  });
});

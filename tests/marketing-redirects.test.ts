import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("next.config redirects", () => {
  const configSource = readFileSync(resolve(process.cwd(), "next.config.ts"), "utf8");

  it("redirects legacy admissions routes to finance pages", () => {
    expect(configSource).not.toContain('source: "/about", destination: "/#about"');
    expect(configSource).toContain(
      'source: "/education-loans", destination: "/services/education-loan"'
    );
    expect(configSource).toContain('source: "/blog"');
    expect(configSource).toContain('source: "/success-stories", destination: "/#testimonials"');
    expect(configSource).toContain(
      'source: "/services/study-abroad", destination: "/services/education-loan"'
    );
  });
});

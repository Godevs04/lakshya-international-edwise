module.exports = {
  ci: {
    collect: {
      // Prefer the final host (www) to avoid a ~550ms apex→www redirect in audits.
      //   LIGHTHOUSE_URL=https://www.lakshyainternationaledwise.com/ npm run lighthouse:ci:prod
      //   npm run build && npm run start && LIGHTHOUSE_URL=http://localhost:4000/ npm run lighthouse:ci
      // Dev/Turbopack builds inflate JS and tank Performance.
      // GitHub: Actions → Lighthouse → Run workflow (or auto after merge to main + 3m).
      url: [
        process.env.LIGHTHOUSE_URL ||
          process.env.NEXT_PUBLIC_SITE_URL ||
          "https://www.lakshyainternationaledwise.com/",
      ],
      numberOfRuns: 1,
      settings: {
        preset: "desktop",
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.5 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "categories:seo": ["error", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};

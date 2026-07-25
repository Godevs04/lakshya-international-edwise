module.exports = {
  ci: {
    collect: {
      // Prefer a production server for real scores:
      //   npm run build && npm run start
      //   LIGHTHOUSE_URL=http://localhost:4000/ npm run lighthouse:ci
      // Dev/Turbopack builds inflate JS and tank Performance.
      url: [
        process.env.LIGHTHOUSE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4000/",
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

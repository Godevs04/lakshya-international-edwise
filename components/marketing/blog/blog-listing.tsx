"use client";

import { useMemo, useState } from "react";
import type { BlogPostMeta } from "@/types/marketing";
import { BlogCard } from "@/components/marketing/cards/blog-card";

interface BlogListingProps {
  posts: BlogPostMeta[];
  categories: string[];
  popularSlugs?: string[];
}

type Tab = "latest" | "popular";

export function BlogListing({ posts, categories, popularSlugs = [] }: BlogListingProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState<Tab>("latest");

  const filtered = useMemo(() => {
    const base =
      tab === "popular" && popularSlugs.length > 0
        ? popularSlugs
            .map((slug) => posts.find((post) => post.slug === slug))
            .filter((post): post is BlogPostMeta => Boolean(post))
        : posts;

    return base.filter((post) => {
      const matchesCategory = category === "All" || post.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [posts, query, category, tab, popularSlugs]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {(["latest", "popular"] as const).map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => setTab(entry)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize ${
                tab === entry
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {entry}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles"
            className="h-10 w-full rounded-full border border-input px-4 text-sm sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setCategory(entry)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  category === entry
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {entry}
              </button>
            ))}
          </div>
        </div>
      </div>

      {featured ? (
        <div className="mb-6 grid gap-4">
          <BlogCard post={featured} featured />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">No articles found.</p>
      )}
    </div>
  );
}

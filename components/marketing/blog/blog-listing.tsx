"use client";

import { useMemo, useState } from "react";
import type { BlogPostMeta } from "@/types/marketing";
import { BlogCard } from "@/components/marketing/cards/marketing-cards";

interface BlogListingProps {
  posts: BlogPostMeta[];
  categories: string[];
}

export function BlogListing({ posts, categories }: BlogListingProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory = category === "All" || post.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [posts, query, category]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">No articles found.</p>
      )}
    </div>
  );
}

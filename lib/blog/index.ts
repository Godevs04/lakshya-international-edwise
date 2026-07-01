import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { BlogPost, BlogPostMeta } from "@/types/marketing";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

const POPULAR_SLUGS = [
  "education-loan-checklist",
  "choose-study-abroad-destination",
  "student-visa-interview-tips",
];

export function computeReadingTimeMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function ensureBlogDir(): void {
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }
}

function parsePost(slug: string, raw: string): BlogPost {
  const { data, content } = matter(raw);
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: String(data.date ?? new Date().toISOString().slice(0, 10)),
    category: String(data.category ?? "General"),
    coverImage: data.coverImage ? String(data.coverImage) : "/marketing/blog/cover-default.svg",
    author: String(data.author ?? "Lakshya Team"),
    readingTimeMinutes: computeReadingTimeMinutes(content),
    content,
  };
}

export function getAllBlogPosts(): BlogPost[] {
  ensureBlogDir();
  const files = fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith(".mdx"));

  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
      return parsePost(slug, raw);
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return getAllBlogPosts().find((post) => post.slug === slug);
}

export function getBlogPostMeta(): BlogPostMeta[] {
  return getAllBlogPosts().map(({ content, ...meta }) => {
    void content;
    return meta;
  });
}

export function getFeaturedPost(): BlogPost | undefined {
  return getAllBlogPosts()[0];
}

export function getPopularPosts(limit = 3): BlogPostMeta[] {
  const all = getBlogPostMeta();
  const popular = POPULAR_SLUGS.map((slug) => all.find((post) => post.slug === slug)).filter(
    (post): post is BlogPostMeta => Boolean(post)
  );
  if (popular.length >= limit) return popular.slice(0, limit);
  const remaining = all.filter((post) => !POPULAR_SLUGS.includes(post.slug));
  return [...popular, ...remaining].slice(0, limit);
}

export function getRelatedPosts(slug: string, limit = 3): BlogPostMeta[] {
  const current = getBlogPost(slug);
  if (!current) return [];
  return getBlogPostMeta()
    .filter((post) => post.slug !== slug && post.category === current.category)
    .slice(0, limit);
}

export function paginateBlogPosts(posts: BlogPostMeta[], page: number, pageSize = 9) {
  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    posts: posts.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}

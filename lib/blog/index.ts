import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { BlogPost, BlogPostMeta } from "@/types/marketing";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

function ensureBlogDir(): void {
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }
}

export function getAllBlogPosts(): BlogPost[] {
  ensureBlogDir();
  const files = fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith(".mdx"));

  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: String(data.title ?? slug),
        description: String(data.description ?? ""),
        date: String(data.date ?? new Date().toISOString().slice(0, 10)),
        category: String(data.category ?? "General"),
        coverImage: data.coverImage ? String(data.coverImage) : undefined,
        author: String(data.author ?? "Lakshya Team"),
        content,
      } satisfies BlogPost;
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

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { getAllBlogPosts, getBlogPost, getRelatedPosts } from "@/lib/blog";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { BlogCard } from "@/components/marketing/cards/blog-card";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";
import { Clock } from "lucide-react";

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  const contact = getMarketingContact();
  if (!post) return { title: contact.companyName };
  return {
    title: `${post.title} | ${contact.companyName}`,
    description: post.description,
    alternates: { canonical: `${getSiteUrl()}/blog/${slug}` },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug);

  return (
    <>
      <article className="section-padding section-white">
        <div className="container mx-auto max-w-3xl px-4">
          <Link href="/blog" className="text-sm font-medium text-primary hover:underline">
            Back to blog
          </Link>

          {post.coverImage && (
            <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-primary">{post.category}</p>
          <h1 className="heading-section mt-2 text-secondary">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>
              {new Date(post.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span>|</span>
            <span>{post.author}</span>
            {post.readingTimeMinutes && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTimeMinutes} min read
              </span>
            )}
          </div>
          <div className="prose prose-slate mt-8 max-w-none">
            <MDXRemote source={post.content} />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <SectionShell variant="muted" title="Related articles" eyebrow="Continue reading">
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((entry) => (
              <BlogCard key={entry.slug} post={entry} />
            ))}
          </div>
        </SectionShell>
      )}

      <CtaBanner />
    </>
  );
}

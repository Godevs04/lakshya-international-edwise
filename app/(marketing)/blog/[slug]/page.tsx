import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { getAllBlogPosts, getBlogPost } from "@/lib/blog";
import { CtaBanner } from "@/components/marketing/sections/cta-banner";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";

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

  return (
    <>
      <article className="section-padding">
        <div className="container mx-auto max-w-3xl px-4">
          <Link href="/blog" className="text-sm font-medium text-primary hover:underline">
            Back to blog
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary">{post.category}</p>
          <h1 className="mt-2 text-3xl font-bold text-secondary md:text-4xl">{post.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {new Date(post.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            | {post.author}
          </p>
          <div className="prose prose-slate mt-8 max-w-none">
            <MDXRemote source={post.content} />
          </div>
        </div>
      </article>
      <CtaBanner />
    </>
  );
}

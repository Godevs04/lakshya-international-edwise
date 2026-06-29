import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/sections/section-heading";
import { BlogListing } from "@/components/marketing/blog/blog-listing";
import { getBlogPostMeta } from "@/lib/blog";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";

export async function generateMetadata(): Promise<Metadata> {
  const contact = getMarketingContact();
  return {
    title: `Blog | ${contact.companyName}`,
    description: "Study abroad tips, visa guidance, and education loan insights.",
    alternates: { canonical: `${getSiteUrl()}/blog` },
  };
}

export default function BlogPage() {
  const posts = getBlogPostMeta();
  const categories = ["All", ...Array.from(new Set(posts.map((post) => post.category)))];

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Blog"
          title="Insights for ambitious students"
          description="Practical guides on admissions, visas, scholarships, and education loans."
          className="mb-8"
        />
        <BlogListing posts={posts} categories={categories} />
      </div>
    </section>
  );
}

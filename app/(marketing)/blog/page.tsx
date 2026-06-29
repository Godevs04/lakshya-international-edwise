import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/sections/page-hero";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { BlogListing } from "@/components/marketing/blog/blog-listing";
import { getBlogPostMeta } from "@/lib/blog";
import { getMarketingContact, getSiteUrl } from "@/lib/config/marketing";

const POPULAR_SLUGS = [
  "education-loan-checklist",
  "choose-study-abroad-destination",
  "student-visa-interview-tips",
];

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
    <>
      <PageHero
        eyebrow="Blog"
        title="Insights for ambitious students"
        description="Practical guides on admissions, visas, scholarships, and education loans."
      />
      <SectionShell variant="white" padding>
        <BlogListing posts={posts} categories={categories} popularSlugs={POPULAR_SLUGS} />
      </SectionShell>
    </>
  );
}

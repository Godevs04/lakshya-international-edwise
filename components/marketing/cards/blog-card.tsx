import Link from "next/link";
import Image from "next/image";
import type { BlogPostMeta } from "@/types/marketing";
import { Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  post: BlogPostMeta;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const coverSrc = post.coverImage ?? "/marketing/blog/cover-default.svg";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "card-premium group block overflow-hidden",
        featured && "md:col-span-2 md:grid md:grid-cols-2"
      )}
    >
      <div className={cn("relative aspect-[16/10] overflow-hidden", featured && "md:aspect-auto md:min-h-full")}>
        <Image
          src={coverSrc}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
        />
      </div>
      <div className="p-5">
        <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {post.category}
        </span>
        <h3 className={cn("mt-2 font-semibold text-secondary", featured ? "text-xl" : "text-lg")}>
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {post.author}
          </span>
          {post.readingTimeMinutes && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTimeMinutes} min read
            </span>
          )}
          <span>
            {new Date(post.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}

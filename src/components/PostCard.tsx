import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "./Icons";
import { formatShortDate } from "@/lib/format";
import { categoryLabel } from "@/lib/categories";

export type PostCardData = {
  slug: string;
  title: string;
  excerpt: string;
  category: string | null;
  createdAt: Date;
  readingTime: string;
  author: { name: string };
  media: { url: string; type: string }[];
  _count: { comments: number };
};

function Cover({ post, sizes, eager }: { post: PostCardData; sizes: string; eager?: boolean }) {
  const cover = post.media[0];
  if (!cover) {
    return (
      <div className="w-full h-full flex items-center justify-center text-faint">
        <ImageIcon className="w-8 h-8" />
      </div>
    );
  }
  if (cover.type === "video") {
    return <video src={cover.url} className="w-full h-full object-cover" muted playsInline />;
  }
  return (
    <Image
      src={cover.url}
      alt=""
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
    />
  );
}

function Meta({ post }: { post: PostCardData }) {
  return (
    <p className="text-xs text-muted">
      {formatShortDate(post.createdAt)} &middot; {post.readingTime}
      {post._count.comments > 0 &&
        ` · ${post._count.comments} ${post._count.comments === 1 ? "comment" : "comments"}`}
    </p>
  );
}

export function FeaturedPostCard({ post }: { post: PostCardData }) {
  if (!post.media[0]) {
    return (
      <Link
        href={`/posts/${post.slug}`}
        className="group block rounded-2xl bg-surface border border-line px-6 py-10 sm:px-12 sm:py-14"
      >
        <p className="text-xs font-medium uppercase tracking-wider text-accent mb-4">
          Latest{categoryLabel(post.category) && ` · ${categoryLabel(post.category)}`}
        </p>
        <h2 className="max-w-2xl font-display text-3xl sm:text-5xl font-medium leading-tight tracking-tight mb-4 group-hover:text-accent transition-colors">
          {post.title}
        </h2>
        <p className="max-w-2xl text-muted leading-relaxed mb-6 line-clamp-3">{post.excerpt}</p>
        <p className="text-sm text-ink mb-1">{post.author.name}</p>
        <Meta post={post} />
      </Link>
    );
  }

  return (
    <Link href={`/posts/${post.slug}`} className="group grid md:grid-cols-5 gap-6 md:gap-10 items-center">
      <div className="relative md:col-span-3 aspect-[3/2] rounded-2xl overflow-hidden bg-subtle">
        <Cover post={post} sizes="(min-width: 768px) 600px, 100vw" eager />
      </div>
      <div className="md:col-span-2">
        <p className="text-xs font-medium uppercase tracking-wider text-accent mb-3">
          Latest{categoryLabel(post.category) && ` · ${categoryLabel(post.category)}`}
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-medium leading-tight tracking-tight mb-3 group-hover:text-accent transition-colors">
          {post.title}
        </h2>
        <p className="text-muted leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
        <p className="text-sm text-ink mb-1">{post.author.name}</p>
        <Meta post={post} />
      </div>
    </Link>
  );
}

export default function PostCard({ post }: { post: PostCardData }) {
  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-subtle mb-4">
        <Cover post={post} sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw" />
      </div>
      {categoryLabel(post.category) && (
        <p className="text-xs font-medium uppercase tracking-wider text-accent mb-2">
          {categoryLabel(post.category)}
        </p>
      )}
      <h3 className="font-display text-xl font-medium leading-snug tracking-tight mb-1.5 group-hover:text-accent transition-colors">
        {post.title}
      </h3>
      <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-3">{post.excerpt}</p>
      <Meta post={post} />
    </Link>
  );
}

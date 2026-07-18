import Image from "next/image";
import Link from "next/link";
import PawIcon from "./PawIcon";
import { formatDate } from "@/lib/format";

type PostCardData = {
  slug: string;
  title: string;
  excerpt: string;
  createdAt: Date;
  media: { url: string; type: string }[];
  _count: { comments: number };
};

export default function PostCard({ post }: { post: PostCardData }) {
  const cover = post.media[0];

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group block rounded-3xl bg-cream-deep/60 hover:bg-cream-deep transition-colors overflow-hidden shadow-sm hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-honey/40 overflow-hidden">
        {cover ? (
          cover.type === "video" ? (
            <video
              src={cover.url}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              muted
              playsInline
            />
          ) : (
            <Image
              src={cover.url}
              alt=""
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-caramel/40">
            <PawIcon className="w-10 h-10" />
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-caramel-deep/60 mb-1">
          {formatDate(post.createdAt)}
        </p>
        <h3 className="font-heading text-xl font-semibold text-caramel-deep mb-1.5 leading-snug">
          {post.title}
        </h3>
        <p className="text-sm text-ink/70 line-clamp-2">{post.excerpt}</p>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-caramel-deep/60 font-medium">
          <PawIcon className="w-3.5 h-3.5" />
          {post._count.comments} {post._count.comments === 1 ? "comment" : "comments"}
        </div>
      </div>
    </Link>
  );
}

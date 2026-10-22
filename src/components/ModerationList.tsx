"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageIcon } from "./Icons";
import { formatShortDate } from "@/lib/format";

type PendingPost = {
  slug: string;
  title: string;
  excerpt: string;
  createdAt: Date;
  author: { name: string; email: string };
  media: { url: string; type: string }[];
};

export default function ModerationList({ posts }: { posts: PendingPost[] }) {
  const router = useRouter();
  const [busySlug, setBusySlug] = useState<string | null>(null);

  async function setStatus(slug: string, status: "PUBLISHED" | "REJECTED") {
    setBusySlug(slug);
    await fetch(`/api/posts/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusySlug(null);
    router.refresh();
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line py-16 text-center">
        <p className="font-display text-xl mb-1">All caught up</p>
        <p className="text-sm text-muted">No stories waiting for review.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line border-y border-line">
      {posts.map((post) => {
        const cover = post.media[0];
        return (
          <li key={post.slug} className="flex flex-col sm:flex-row gap-4 sm:gap-5 py-6">
            <div className="relative w-full sm:w-36 aspect-[4/3] shrink-0 rounded-lg overflow-hidden bg-subtle">
              {cover && cover.type === "image" ? (
                <Image src={cover.url} alt="" fill sizes="144px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-faint">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/posts/${post.slug}`}
                className="font-display text-xl font-medium tracking-tight hover:text-accent"
              >
                {post.title}
              </Link>
              <p className="text-xs text-muted mt-1 mb-2">
                {post.author.name} &middot; {post.author.email} &middot;{" "}
                {formatShortDate(post.createdAt)}
              </p>
              <p className="text-sm text-muted line-clamp-2 mb-4">{post.excerpt}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatus(post.slug, "PUBLISHED")}
                  disabled={busySlug === post.slug}
                  className="btn btn-primary h-8 px-3"
                >
                  Approve
                </button>
                <button
                  onClick={() => setStatus(post.slug, "REJECTED")}
                  disabled={busySlug === post.slug}
                  className="btn btn-secondary h-8 px-3"
                >
                  Reject
                </button>
                <Link href={`/posts/${post.slug}`} className="btn btn-ghost h-8 px-3">
                  Preview
                </Link>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

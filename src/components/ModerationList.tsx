"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format";

type PendingPost = {
  slug: string;
  title: string;
  excerpt: string;
  createdAt: Date;
  author: { name: string; email: string };
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
      <div className="rounded-3xl bg-cream-deep/60 py-16 text-center text-caramel-deep/70">
        <p className="font-heading text-xl mb-2">All caught up</p>
        <p className="text-sm">No posts waiting for review.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {posts.map((post) => (
        <li key={post.slug} className="rounded-2xl bg-cream-deep/60 p-5">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <Link
              href={`/posts/${post.slug}`}
              className="font-heading text-lg font-semibold text-caramel-deep hover:underline"
            >
              {post.title}
            </Link>
            <span className="text-xs text-caramel-deep/50">{formatDate(post.createdAt)}</span>
          </div>
          <p className="text-xs text-caramel-deep/60 mb-2">
            by {post.author.name} &middot; {post.author.email}
          </p>
          <p className="text-sm text-ink/80 mb-4">{post.excerpt}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setStatus(post.slug, "PUBLISHED")}
              disabled={busySlug === post.slug}
              className="px-4 py-1.5 rounded-full bg-caramel text-cream text-sm font-semibold hover:bg-caramel-deep transition-colors disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => setStatus(post.slug, "REJECTED")}
              disabled={busySlug === post.slug}
              className="px-4 py-1.5 rounded-full bg-cream text-blush-deep text-sm font-semibold hover:bg-blush/30 transition-colors disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

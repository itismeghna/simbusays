"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PostActions({ slug }: { slug: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this post? This can't be undone.")) return;
    setDeleting(true);
    await fetch(`/api/posts/${slug}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={`/posts/${slug}/edit`}
        className="px-4 py-1.5 rounded-full bg-cream-deep text-caramel-deep text-xs font-semibold hover:bg-honey/40 transition-colors"
      >
        Edit
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="px-4 py-1.5 rounded-full bg-cream-deep text-blush-deep text-xs font-semibold hover:bg-blush/30 transition-colors disabled:opacity-50"
      >
        {deleting ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}

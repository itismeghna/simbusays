"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PencilIcon, TrashIcon } from "./Icons";

export default function PostActions({ slug }: { slug: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this post and its photos? This can't be undone.")) return;
    setDeleting(true);
    await fetch(`/api/posts/${slug}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <Link href={`/posts/${slug}/edit`} className="btn btn-secondary h-8 px-3">
        <PencilIcon className="w-3.5 h-3.5" />
        Edit
      </Link>
      <button onClick={handleDelete} disabled={deleting} className="btn btn-danger h-8 px-3">
        <TrashIcon className="w-3.5 h-3.5" />
        {deleting ? "Deleting…" : "Delete"}
      </button>
    </>
  );
}

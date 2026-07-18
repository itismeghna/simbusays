"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PawIcon from "./PawIcon";
import { formatDate } from "@/lib/format";

type CommentData = {
  id: string;
  name: string;
  body: string;
  createdAt: Date;
};

export default function CommentSection({
  slug,
  comments,
}: {
  slug: string;
  comments: CommentData[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const res = await fetch(`/api/posts/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, body }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Try again?");
      setStatus("error");
      return;
    }

    setName("");
    setBody("");
    setStatus("idle");
    router.refresh();
  }

  return (
    <div className="mt-10">
      <h2 className="font-heading text-2xl font-semibold text-caramel-deep mb-5 flex items-center gap-2">
        <PawIcon className="w-5 h-5 text-caramel" />
        {comments.length === 0
          ? "Be the first to comment"
          : `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`}
      </h2>

      <ul className="space-y-4 mb-8">
        {comments.map((c) => (
          <li key={c.id} className="rounded-2xl bg-cream-deep/60 p-4">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span className="font-semibold text-caramel-deep">{c.name}</span>
              <span className="text-xs text-caramel-deep/50">
                {formatDate(new Date(c.createdAt))}
              </span>
            </div>
            <p className="text-sm text-ink/80 whitespace-pre-wrap">{c.body}</p>
          </li>
        ))}
      </ul>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-cream-deep/40 p-5 flex flex-col gap-3"
      >
        <p className="font-heading text-lg text-caramel-deep">Leave a comment</p>
        <input
          type="text"
          required
          maxLength={60}
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-honey/60 bg-cream px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-honey-deep"
        />
        <textarea
          required
          maxLength={2000}
          placeholder="Say something nice (or tell Simbu he's a good boy)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="rounded-xl border border-honey/60 bg-cream px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-honey-deep"
        />
        {error && <p className="text-sm text-blush-deep">{error}</p>}
        <button
          type="submit"
          disabled={status === "loading"}
          className="self-start px-5 py-2 rounded-full bg-caramel text-cream text-sm font-semibold hover:bg-caramel-deep transition-colors disabled:opacity-50"
        >
          {status === "loading" ? "Posting…" : "Post comment"}
        </button>
      </form>
    </div>
  );
}

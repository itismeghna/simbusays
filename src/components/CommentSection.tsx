"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PawIcon from "./PawIcon";
import { formatDate } from "@/lib/format";
import type { SessionUser } from "@/lib/auth";

type CommentData = {
  id: string;
  userId: string;
  body: string;
  createdAt: Date;
  user: { name: string };
};

export default function CommentSection({
  slug,
  comments,
  currentUser,
}: {
  slug: string;
  comments: CommentData[];
  currentUser: SessionUser | null;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const res = await fetch(`/api/posts/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Try again?");
      setStatus("error");
      return;
    }

    setBody("");
    setStatus("idle");
    router.refresh();
  }

  async function saveEdit(id: string) {
    await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: editText }),
    });
    setEditingId(null);
    router.refresh();
  }

  async function deleteComment(id: string) {
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
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
        {comments.map((c) => {
          const canManage = currentUser && (currentUser.id === c.userId || currentUser.role === "ADMIN");
          return (
            <li key={c.id} className="rounded-2xl bg-cream-deep/60 p-4">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="font-semibold text-caramel-deep">{c.user.name}</span>
                <span className="text-xs text-caramel-deep/50">
                  {formatDate(new Date(c.createdAt))}
                </span>
              </div>
              {editingId === c.id ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    className="rounded-xl border border-honey/60 bg-cream px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-honey-deep"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(c.id)}
                      className="text-xs font-semibold text-caramel-deep hover:underline"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs font-semibold text-ink/50 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-ink/80 whitespace-pre-wrap">{c.body}</p>
                  {canManage && (
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setEditText(c.body);
                        }}
                        className="text-xs font-semibold text-caramel-deep/70 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteComment(c.id)}
                        className="text-xs font-semibold text-blush-deep hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>

      {currentUser ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-cream-deep/40 p-5 flex flex-col gap-3"
        >
          <p className="font-heading text-lg text-caramel-deep">Leave a comment</p>
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
      ) : (
        <div className="rounded-2xl bg-cream-deep/40 p-5 text-center text-sm text-ink/70">
          <Link href="/login" className="font-semibold text-caramel-deep hover:underline">
            Log in
          </Link>{" "}
          or{" "}
          <Link href="/register" className="font-semibold text-caramel-deep hover:underline">
            register
          </Link>{" "}
          to leave a comment.
        </div>
      )}
    </div>
  );
}

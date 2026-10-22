"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import { formatShortDate } from "@/lib/format";
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
    if (!confirm("Delete this comment?")) return;
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <section className="mt-16 pt-10 border-t border-line">
      <h2 className="font-display text-2xl font-medium tracking-tight mb-8">
        {comments.length === 0
          ? "Comments"
          : `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`}
      </h2>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-10">
          <Avatar name={currentUser.name} />
          <div className="flex-1">
            <textarea
              required
              maxLength={2000}
              placeholder="Add a comment…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="input h-auto py-2.5 resize-none leading-relaxed"
            />
            {error && <p className="text-sm text-danger mt-2">{error}</p>}
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={status === "loading" || !body.trim()}
                className="btn btn-primary"
              >
                {status === "loading" ? "Posting…" : "Post comment"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 rounded-xl bg-subtle px-5 py-4 text-sm text-muted">
          <Link href="/login" className="font-medium text-ink underline underline-offset-4">
            Log in
          </Link>{" "}
          or{" "}
          <Link href="/register" className="font-medium text-ink underline underline-offset-4">
            create an account
          </Link>{" "}
          to join the conversation.
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-muted">No comments yet — be the first.</p>
      ) : (
        <ul className="space-y-7">
          {comments.map((c) => {
            const canManage =
              currentUser && (currentUser.id === c.userId || currentUser.role === "ADMIN");
            return (
              <li key={c.id} className="flex gap-3">
                <Avatar name={c.user.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium">{c.user.name}</span>
                    <span className="text-xs text-faint">
                      {formatShortDate(new Date(c.createdAt))}
                    </span>
                  </div>
                  {editingId === c.id ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                        className="input h-auto py-2.5 resize-none leading-relaxed"
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => saveEdit(c.id)} className="btn btn-primary h-8 px-3">
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="btn btn-ghost h-8 px-3">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-[15px] leading-relaxed text-ink/90 whitespace-pre-wrap">
                        {c.body}
                      </p>
                      {canManage && (
                        <div className="flex gap-4 mt-1.5">
                          <button
                            onClick={() => {
                              setEditingId(c.id);
                              setEditText(c.body);
                            }}
                            className="text-xs text-muted hover:text-ink"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteComment(c.id)}
                            className="text-xs text-muted hover:text-danger"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

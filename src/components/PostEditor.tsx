"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MediaManager, { existingMedia, type EditorMedia } from "./MediaManager";
import { uploadFiles } from "@/lib/upload-client";
import { CATEGORIES } from "@/lib/categories";

type ExistingPost = {
  slug: string;
  title: string;
  body: string;
  category: string | null;
  media: { id: string; url: string; type: string }[];
};

export default function PostEditor({
  isAdmin,
  existingPost,
}: {
  isAdmin: boolean;
  existingPost?: ExistingPost;
}) {
  const router = useRouter();
  const isEdit = Boolean(existingPost);
  const [title, setTitle] = useState(existingPost?.title ?? "");
  const [body, setBody] = useState(existingPost?.body ?? "");
  const [category, setCategory] = useState<string | null>(existingPost?.category ?? null);
  const [media, setMedia] = useState<EditorMedia[]>(() => existingMedia(existingPost?.media ?? []));
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "saving">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    let mediaPayload;
    try {
      const pending = media.filter((m) => m.file);
      if (pending.length > 0) setStatus("uploading");
      const uploaded = await uploadFiles(pending.map((m) => m.file!));
      const uploadedByKey = new Map(pending.map((m, i) => [m.key, uploaded[i]]));
      mediaPayload = media.map((m) =>
        m.file ? uploadedByKey.get(m.key)! : { id: m.id, url: m.url!, type: m.type }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Try again?");
      setStatus("idle");
      return;
    }

    setStatus("saving");
    const res = await fetch(isEdit ? `/api/posts/${existingPost!.slug}` : "/api/posts", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, category, media: mediaPayload }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Try again?");
      setStatus("idle");
      return;
    }

    const data = await res.json();
    router.push(isEdit || isAdmin ? `/posts/${data.post.slug}` : "/new-post/submitted");
    router.refresh();
  }

  const busy = status !== "idle";
  const submitLabel =
    status === "uploading"
      ? "Uploading…"
      : status === "saving"
        ? "Saving…"
        : isEdit
          ? "Save changes"
          : isAdmin
            ? "Publish"
            : "Submit for review";

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-4 mb-10">
        <p className="text-sm text-muted">{isEdit ? "Editing story" : "New story"}</p>
        <div className="flex items-center gap-2">
          <Link
            href={isEdit ? `/posts/${existingPost!.slug}` : "/"}
            className="btn btn-ghost"
          >
            Cancel
          </Link>
          <button type="submit" disabled={busy} className="btn btn-primary">
            {submitLabel}
          </button>
        </div>
      </div>

      {!isEdit && !isAdmin && (
        <p className="mb-8 rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent">
          Meghna will give your story a quick read before it goes live.
        </p>
      )}

      <input
        type="text"
        required
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-transparent font-display text-4xl sm:text-5xl font-medium tracking-tight placeholder:text-faint focus:outline-none mb-5"
      />

      <div className="flex flex-wrap items-center gap-1.5 mb-8" role="radiogroup" aria-label="Theme">
        <span className="text-sm text-muted mr-1.5">Theme</span>
        {CATEGORIES.map((c) => {
          const selected = category === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setCategory(selected ? null : c.slug)}
              className={`h-7 px-3 rounded-full text-xs font-medium border transition-colors ${
                selected
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line text-muted hover:text-ink hover:border-ink/20"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <textarea
        required
        placeholder="Tell your story… Leave a blank line between paragraphs."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full min-h-64 bg-transparent text-lg leading-[1.75] placeholder:text-faint resize-none field-sizing-content focus:outline-none"
      />

      <div className="mt-10 pt-8 border-t border-line">
        <MediaManager items={media} onChange={setMedia} />
      </div>

      {error && <p className="text-sm text-danger mt-6">{error}</p>}
    </form>
  );
}

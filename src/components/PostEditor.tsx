"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PawIcon from "./PawIcon";

type ExistingPost = {
  slug: string;
  title: string;
  body: string;
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
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(e.target.files ?? []));
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isEdit && existingPost) {
      const res = await fetch(`/api/posts/${existingPost.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      setLoading(false);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Try again?");
        return;
      }
      const data = await res.json();
      router.push(`/posts/${data.post.slug}`);
      router.refresh();
      return;
    }

    const formData = new FormData();
    formData.set("title", title);
    formData.set("body", body);
    files.forEach((f) => formData.append("media", f));

    const res = await fetch("/api/posts", { method: "POST", body: formData });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Try again?");
      return;
    }

    const data = await res.json();
    if (isAdmin) {
      router.push(`/posts/${data.post.slug}`);
    } else {
      router.push("/new-post/submitted");
    }
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-caramel-deep flex items-center gap-2">
          <PawIcon className="w-5 h-5 text-caramel" />
          {isEdit ? "Edit adventure" : "New adventure"}
        </h1>
      </div>

      {!isEdit && !isAdmin && (
        <p className="mb-5 text-sm text-caramel-deep bg-cream-deep/60 rounded-xl px-4 py-3">
          Your post will be sent to Meghna for a quick review before it goes live.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          required
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl border border-honey/60 bg-cream px-4 py-3 font-heading text-lg focus:outline-none focus:ring-2 focus:ring-honey-deep"
        />
        <textarea
          required
          placeholder="Tell the story… (leave a blank line between paragraphs)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          className="rounded-xl border border-honey/60 bg-cream px-4 py-3 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-honey-deep"
        />

        {!isEdit && (
          <div>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream-deep text-caramel-deep text-sm font-semibold cursor-pointer hover:bg-honey/40 transition-colors">
              <PawIcon className="w-4 h-4" />
              Add photos or videos
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFiles}
                className="hidden"
              />
            </label>

            {files.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded-full bg-cream-deep/70 pl-3 pr-1 py-1 text-xs text-caramel-deep"
                  >
                    {f.name}
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-honey/50"
                      aria-label={`Remove ${f.name}`}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {error && <p className="text-sm text-blush-deep">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="self-start px-6 py-2.5 rounded-full bg-caramel text-cream font-semibold hover:bg-caramel-deep transition-colors disabled:opacity-50"
        >
          {loading
            ? isEdit
              ? "Saving…"
              : "Submitting…"
            : isEdit
              ? "Save changes"
              : isAdmin
                ? "Publish adventure"
                : "Submit for review"}
        </button>
      </form>
    </div>
  );
}

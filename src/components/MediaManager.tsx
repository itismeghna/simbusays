"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  PlusIcon,
  RotateIcon,
  XIcon,
} from "./Icons";
import { fetchAsFile, mediaTypeOf, processImage, type MediaType } from "@/lib/upload-client";

/** A photo/video in the editor: either already stored (`id` + `url`) or a local `file` awaiting upload. */
export type EditorMedia = {
  key: string;
  type: MediaType;
  preview: string;
  id?: string;
  url?: string;
  file?: File;
};

let keyCounter = 0;
const nextKey = () => `m${++keyCounter}`;

export function existingMedia(items: { id: string; url: string; type: string }[]): EditorMedia[] {
  return items.map((m) => ({
    key: nextKey(),
    id: m.id,
    url: m.url,
    type: m.type === "video" ? "video" : "image",
    preview: m.url,
  }));
}

function localMedia(file: File): EditorMedia {
  return { key: nextKey(), type: mediaTypeOf(file), file, preview: URL.createObjectURL(file) };
}

function revoke(item: EditorMedia) {
  if (item.file) URL.revokeObjectURL(item.preview);
}

export default function MediaManager({
  items,
  onChange,
}: {
  items: EditorMedia[];
  onChange: (items: EditorMedia[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busyKeys, setBusyKeys] = useState<Set<string>>(new Set());
  const [preparing, setPreparing] = useState(0);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [fileDragOver, setFileDragOver] = useState(false);
  const [error, setError] = useState("");

  // Latest items for async callbacks and unmount cleanup.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => () => itemsRef.current.forEach(revoke), []);

  async function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    if (files.length === 0) return;
    setError("");
    setPreparing((n) => n + files.length);
    const prepared = await Promise.all(files.map((f) => processImage(f)));
    setPreparing((n) => n - files.length);
    onChange([...itemsRef.current, ...prepared.map(localMedia)]);
  }

  function remove(key: string) {
    const item = items.find((i) => i.key === key);
    if (item) revoke(item);
    onChange(items.filter((i) => i.key !== key));
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  async function rotate(key: string) {
    const item = items.find((i) => i.key === key);
    if (!item || item.type !== "image") return;
    setBusyKeys((s) => new Set(s).add(key));
    setError("");
    try {
      const source = item.file ?? (await fetchAsFile(item.url!));
      const rotated = await processImage(source, 90);
      revoke(item);
      // A rotated photo is a new file; the old one is cleaned up on save.
      onChange(
        itemsRef.current.map((i) =>
          i.key === key
            ? { key, type: "image", file: rotated, preview: URL.createObjectURL(rotated) }
            : i
        )
      );
    } catch {
      setError("Couldn't rotate that photo. Try again?");
    } finally {
      setBusyKeys((s) => {
        const next = new Set(s);
        next.delete(key);
        return next;
      });
    }
  }

  function handleDrop(e: React.DragEvent, targetIndex?: number) {
    e.preventDefault();
    setFileDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    } else if (dragKey && targetIndex !== undefined) {
      move(items.findIndex((i) => i.key === dragKey), targetIndex);
    }
    setDragKey(null);
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <p className="label mb-0">Photos &amp; videos</p>
        {items.length > 1 && (
          <p className="text-xs text-muted">Drag or use the arrows to reorder</p>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (e.dataTransfer.types.includes("Files")) setFileDragOver(true);
        }}
        onDragLeave={() => setFileDragOver(false)}
        onDrop={(e) => handleDrop(e)}
        className={`rounded-xl border border-dashed p-3 transition-colors ${
          fileDragOver ? "border-accent bg-accent-soft/50" : "border-line bg-surface"
        }`}
      >
        {items.length === 0 && preparing === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 py-10 text-muted hover:text-ink"
          >
            <ImageIcon className="w-7 h-7" />
            <span className="text-sm">
              <span className="font-medium text-ink">Add photos or videos</span> or drag them here
            </span>
          </button>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((item, index) => {
              const busy = busyKeys.has(item.key);
              return (
                <li
                  key={item.key}
                  draggable
                  onDragStart={() => setDragKey(item.key)}
                  onDragEnd={() => setDragKey(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.stopPropagation();
                    handleDrop(e, index);
                  }}
                  className={`group relative aspect-square rounded-lg overflow-hidden bg-subtle ${
                    dragKey === item.key ? "opacity-40" : ""
                  }`}
                >
                  {item.type === "video" ? (
                    <video src={item.preview} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- local blob previews
                    <img src={item.preview} alt="" className="w-full h-full object-cover" />
                  )}

                  {index === 0 && (
                    <span className="absolute top-2 left-2 rounded-full bg-ink/80 px-2 py-0.5 text-[11px] font-medium text-white">
                      Cover
                    </span>
                  )}
                  {item.type === "video" && (
                    <span className="absolute bottom-2 left-2 rounded-full bg-ink/80 px-2 py-0.5 text-[11px] font-medium text-white">
                      Video
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => remove(item.key)}
                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-surface/90 text-ink shadow-sm hover:bg-surface"
                    aria-label="Remove"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                  </button>

                  <div className="absolute inset-x-2 bottom-2 flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => move(index, 0)}
                        className="mr-auto h-7 px-2 rounded-full bg-surface/90 text-[11px] font-medium shadow-sm hover:bg-surface"
                      >
                        Make cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => move(index, index - 1)}
                      disabled={index === 0}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-surface/90 shadow-sm hover:bg-surface disabled:opacity-40"
                      aria-label="Move earlier"
                    >
                      <ChevronLeftIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, index + 1)}
                      disabled={index === items.length - 1}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-surface/90 shadow-sm hover:bg-surface disabled:opacity-40"
                      aria-label="Move later"
                    >
                      <ChevronRightIcon className="w-3.5 h-3.5" />
                    </button>
                    {item.type === "image" && (
                      <button
                        type="button"
                        onClick={() => rotate(item.key)}
                        disabled={busy}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-surface/90 shadow-sm hover:bg-surface disabled:opacity-40"
                        aria-label="Rotate 90°"
                      >
                        <RotateIcon className={`w-3.5 h-3.5 ${busy ? "animate-spin" : ""}`} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}

            {Array.from({ length: preparing }).map((_, i) => (
              <li key={`preparing-${i}`} className="aspect-square rounded-lg bg-subtle animate-pulse" />
            ))}

            <li>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-full aspect-square rounded-lg border border-dashed border-line flex flex-col items-center justify-center gap-1.5 text-sm text-muted hover:text-ink hover:bg-subtle"
              >
                <PlusIcon className="w-5 h-5" />
                Add more
              </button>
            </li>
          </ul>
        )}
      </div>

      {error && <p className="text-sm text-danger mt-2">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
        className="hidden"
      />
    </div>
  );
}

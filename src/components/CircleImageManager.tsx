"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import CircleCropper from "./CircleCropper";
import { CheckIcon, PlusIcon, XIcon } from "./Icons";
import { uploadFiles } from "@/lib/upload-client";

type SavedImage = { id: string; url: string; active: boolean };

/** Upload, frame, and switch between circular site images (the logo, Meghna's photo). */
export default function CircleImageManager({
  images,
  defaultUrl,
  apiPath,
  noun,
  cropHint,
  fitClass = "object-cover",
  showHeaderPreview = false,
}: {
  images: SavedImage[];
  defaultUrl: string;
  apiPath: string;
  noun: string;
  cropHint: string;
  fitClass?: string;
  showHeaderPreview?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const active = images.find((l) => l.active);
  const currentUrl = active?.url ?? defaultUrl;

  async function saveNew(cropped: File) {
    setSaving(true);
    setError("");
    try {
      const [uploaded] = await uploadFiles([cropped]);
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: uploaded.url }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error);
      setPicked(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : `Couldn't save the ${noun}.`);
    } finally {
      setSaving(false);
    }
  }

  async function activate(id: string | null) {
    setBusyId(id ?? "default");
    setError("");
    const res = await fetch(apiPath, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) setError(`Couldn't switch the ${noun}. Try again?`);
    setBusyId(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm(`Delete this ${noun}? You can always upload it again.`)) return;
    setBusyId(id);
    const res = await fetch(`${apiPath}/${id}`, { method: "DELETE" });
    if (!res.ok) setError((await res.json().catch(() => ({}))).error ?? "Couldn't delete it.");
    setBusyId(null);
    router.refresh();
  }

  const choices = [
    { id: null, url: defaultUrl, active: !active, label: "Original" },
    ...images.map((l) => ({ ...l, label: null })),
  ];

  return (
    <div>
      <section className="flex flex-col sm:flex-row items-center gap-8 rounded-2xl border border-line bg-surface p-6 sm:p-8 mb-10">
        <span className="relative w-32 h-32 shrink-0 rounded-full overflow-hidden bg-subtle">
          <Image src={currentUrl} alt={`Current ${noun}`} fill sizes="128px" className={fitClass} />
        </span>
        <div className="text-center sm:text-left">
          {showHeaderPreview && (
            <>
              <p className="text-sm text-muted mb-3">How it looks in the header</p>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-line px-4 py-2 mb-5">
                <span className="relative w-8 h-8 rounded-full overflow-hidden bg-subtle">
                  <Image src={currentUrl} alt="" fill sizes="32px" className={fitClass} />
                </span>
                <span className="font-display text-xl font-semibold tracking-tight">Simbu Says</span>
              </div>
            </>
          )}
          <div>
            <button onClick={() => inputRef.current?.click()} disabled={saving} className="btn btn-primary">
              <PlusIcon className="w-4 h-4" />
              Upload a new photo
            </button>
          </div>
        </div>
      </section>

      {picked && (
        <div className="mb-10">
          <CircleCropper
            file={picked}
            hint={cropHint}
            saveLabel={`Use this ${noun}`}
            saving={saving}
            onCancel={() => setPicked(null)}
            onSave={saveNew}
          />
        </div>
      )}

      {error && <p className="text-sm text-danger mb-6">{error}</p>}

      <h2 className="text-sm font-medium text-muted mb-4">Your {noun}s</h2>
      <ul className="grid grid-cols-3 sm:grid-cols-5 gap-5">
        {choices.map((choice) => {
          const key = choice.id ?? "default";
          return (
            <li key={key} className="relative flex flex-col items-center gap-2">
              <button
                onClick={() => !choice.active && activate(choice.id)}
                disabled={choice.active || busyId !== null}
                className={`relative w-20 h-20 rounded-full overflow-hidden bg-subtle transition-shadow ${
                  choice.active
                    ? "ring-2 ring-accent ring-offset-2 ring-offset-paper"
                    : "hover:ring-2 hover:ring-line hover:ring-offset-2 hover:ring-offset-paper"
                } ${busyId === key ? "opacity-50" : ""}`}
                aria-label={choice.active ? `Current ${noun}` : `Use this ${noun}`}
              >
                <Image src={choice.url} alt="" fill sizes="80px" className={fitClass} />
              </button>
              <span className="text-xs text-muted inline-flex items-center gap-1">
                {choice.active ? (
                  <>
                    <CheckIcon className="w-3 h-3 text-accent" /> In use
                  </>
                ) : (
                  choice.label ?? "Tap to use"
                )}
              </span>
              {choice.id && !choice.active && (
                <button
                  onClick={() => remove(choice.id!)}
                  disabled={busyId !== null}
                  className="absolute top-0 right-1 sm:right-3 w-6 h-6 flex items-center justify-center rounded-full bg-surface border border-line text-muted hover:text-danger"
                  aria-label={`Delete ${noun}`}
                >
                  <XIcon className="w-3 h-3" />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setPicked(file);
          e.target.value = "";
        }}
        className="hidden"
      />
    </div>
  );
}

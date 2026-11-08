"use client";

import { useEffect, useRef, useState } from "react";

const FRAME = 240; // on-screen circle, px
const OUTPUT = 512; // saved image, px square

type Offset = { x: number; y: number };

/**
 * Lets the user pan (drag) and zoom a photo inside a circular frame, then
 * renders exactly what's in the frame to a square PNG (transparency kept).
 */
export default function CircleCropper({
  file,
  hint,
  saveLabel,
  saving,
  onCancel,
  onSave,
}: {
  file: File;
  hint: string;
  saveLabel: string;
  saving: boolean;
  onCancel: () => void;
  onSave: (cropped: File) => void;
}) {
  const [loaded, setLoaded] = useState<{ bitmap: ImageBitmap; url: string } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const drag = useRef<{ startX: number; startY: number; from: Offset } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = URL.createObjectURL(file);
    createImageBitmap(file, { imageOrientation: "from-image" })
      .then((bitmap) => (cancelled ? bitmap.close() : setLoaded({ bitmap, url })))
      .catch(() => setError("That file couldn't be opened as an image."));
    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const bitmap = loaded?.bitmap ?? null;

  // Size of the photo on screen: "cover" the circle at zoom 1.
  const base = bitmap ? FRAME / Math.min(bitmap.width, bitmap.height) : 1;
  const dispW = bitmap ? bitmap.width * base * zoom : FRAME;
  const dispH = bitmap ? bitmap.height * base * zoom : FRAME;

  function clamp(o: Offset, w = dispW, h = dispH): Offset {
    const maxX = (w - FRAME) / 2;
    const maxY = (h - FRAME) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, o.x)),
      y: Math.max(-maxY, Math.min(maxY, o.y)),
    };
  }

  function changeZoom(next: number) {
    setZoom(next);
    if (bitmap) {
      setOffset((o) => clamp(o, bitmap.width * base * next, bitmap.height * base * next));
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, from: offset };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const { startX, startY, from } = drag.current;
    setOffset(clamp({ x: from.x + e.clientX - startX, y: from.y + e.clientY - startY }));
  }

  async function handleSave() {
    if (!bitmap) return;
    const k = OUTPUT / FRAME;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      bitmap,
      ((FRAME - dispW) / 2 + offset.x) * k,
      ((FRAME - dispH) / 2 + offset.y) * k,
      dispW * k,
      dispH * k
    );
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
    if (!blob) return setError("Couldn't prepare the image. Try another photo?");
    onSave(new File([blob], "image.png", { type: "image/png" }));
  }

  if (error) {
    return (
      <div className="rounded-xl border border-line bg-surface p-6 text-center">
        <p className="text-sm text-danger mb-4">{error}</p>
        <button onClick={onCancel} className="btn btn-secondary">
          Choose another photo
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-6 flex flex-col items-center">
      <p className="text-sm text-muted mb-5">{hint}</p>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        className="relative overflow-hidden rounded-full bg-subtle ring-1 ring-line cursor-grab active:cursor-grabbing touch-none select-none"
        style={{ width: FRAME, height: FRAME }}
      >
        {loaded && (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview
          <img
            src={loaded.url}
            alt=""
            draggable={false}
            className="absolute max-w-none pointer-events-none"
            style={{
              width: dispW,
              height: dispH,
              left: (FRAME - dispW) / 2 + offset.x,
              top: (FRAME - dispH) / 2 + offset.y,
            }}
          />
        )}
      </div>

      <label className="mt-6 flex w-full max-w-xs items-center gap-3 text-xs text-muted">
        Zoom
        <input
          type="range"
          min={1}
          max={4}
          step={0.01}
          value={zoom}
          onChange={(e) => changeZoom(Number(e.target.value))}
          className="flex-1 accent-[var(--color-accent)]"
          aria-label="Zoom"
        />
      </label>

      <div className="mt-6 flex gap-2">
        <button onClick={onCancel} disabled={saving} className="btn btn-ghost">
          Cancel
        </button>
        <button onClick={handleSave} disabled={!bitmap || saving} className="btn btn-primary">
          {saving ? "Saving…" : saveLabel}
        </button>
      </div>
    </div>
  );
}

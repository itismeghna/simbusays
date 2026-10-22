"use client";

const MAX_DIMENSION = 2400;
const JPEG_QUALITY = 0.86;

export type MediaType = "image" | "video";

export function mediaTypeOf(file: Blob): MediaType {
  return file.type.startsWith("video") ? "video" : "image";
}

function canvasToFile(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Could not process image"));
        const base = name.replace(/\.[^.]+$/, "") || "photo";
        resolve(new File([blob], `${base}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

/**
 * Re-encodes a photo so it's upright (EXIF orientation baked in), at most
 * MAX_DIMENSION px on its longest side, and optionally rotated. GIFs, videos,
 * and anything the browser can't decode are returned untouched.
 */
export async function processImage(file: File, rotateDegrees = 0): Promise<File> {
  if (mediaTypeOf(file) !== "image" || file.type === "image/gif") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  // Small, unrotated images that are already compact aren't worth re-encoding.
  if (!rotateDegrees && scale === 1 && file.size < 500_000) {
    bitmap.close();
    return file;
  }

  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const quarterTurn = Math.abs(rotateDegrees) % 180 === 90;

  const canvas = document.createElement("canvas");
  canvas.width = quarterTurn ? h : w;
  canvas.height = quarterTurn ? w : h;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotateDegrees * Math.PI) / 180);
  ctx.drawImage(bitmap, -w / 2, -h / 2, w, h);
  bitmap.close();

  return canvasToFile(canvas, file.name);
}

/** Downloads one of our already-uploaded images so it can be edited again. */
export async function fetchAsFile(url: string): Promise<File> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load image");
  const blob = await res.blob();
  const name = url.split("/").pop() ?? "photo.jpg";
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}

/** Uploads files straight to storage and returns their public URLs, in order. */
export async function uploadFiles(files: File[]): Promise<{ url: string; type: MediaType }[]> {
  if (files.length === 0) return [];

  const res = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files: files.map((f) => ({ name: f.name })) }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Upload failed");
  }
  const { targets } = (await res.json()) as {
    targets: { signedUrl: string; publicUrl: string }[];
  };

  return Promise.all(
    files.map(async (file, i) => {
      const body = new FormData();
      body.append("cacheControl", "31536000");
      body.append("", file, file.name);
      const put = await fetch(targets[i].signedUrl, { method: "PUT", body });
      if (!put.ok) {
        throw new Error(
          put.status === 413
            ? `${file.name} is too large to upload.`
            : `Couldn't upload ${file.name}.`
        );
      }
      return { url: targets[i].publicUrl, type: mediaTypeOf(file) };
    })
  );
}

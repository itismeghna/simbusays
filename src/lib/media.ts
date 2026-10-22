import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin, MEDIA_BUCKET } from "@/lib/supabase";

export type MediaInput = { id?: string; url: string; type: "image" | "video" };

const PUBLIC_PREFIX = `${process.env.SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/`;

/** Storage path for one of our own public media URLs, or null for anything else. */
export function storagePathFromUrl(url: string) {
  return url.startsWith(PUBLIC_PREFIX) ? url.slice(PUBLIC_PREFIX.length) : null;
}

/** Validates client-supplied media, keeping only items that live in our own bucket. */
export function parseMediaInput(raw: unknown): MediaInput[] | null {
  if (!Array.isArray(raw)) return null;
  const items: MediaInput[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") return null;
    const { id, url, type } = entry as Record<string, unknown>;
    if (typeof url !== "string" || !storagePathFromUrl(url)) return null;
    if (type !== "image" && type !== "video") return null;
    items.push({ id: typeof id === "string" ? id : undefined, url, type });
  }
  return items;
}

/** Signed URLs let the browser upload straight to storage, bypassing the
 *  serverless request-body limit that large photos and videos would hit. */
export async function createUploadTargets(files: { name: string }[]) {
  const targets = [];
  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, "");
    const storagePath = `${crypto.randomUUID()}${ext}`;
    const { data, error } = await supabaseAdmin.storage
      .from(MEDIA_BUCKET)
      .createSignedUploadUrl(storagePath);
    if (error || !data) throw new Error(error?.message ?? "Could not create upload URL");
    const { data: pub } = supabaseAdmin.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);
    targets.push({ signedUrl: data.signedUrl, publicUrl: pub.publicUrl });
  }
  return targets;
}

export async function removeStorageObjects(urls: string[]) {
  const paths = urls.map(storagePathFromUrl).filter((p): p is string => Boolean(p));
  if (paths.length === 0) return;
  // Best effort: a leftover file is harmless, a failed save is not.
  await supabaseAdmin.storage.from(MEDIA_BUCKET).remove(paths).catch(() => {});
}

/** Makes a post's media exactly match `items`, in order. */
export async function syncPostMedia(postId: string, items: MediaInput[]) {
  const existing = await prisma.media.findMany({ where: { postId } });
  const keepIds = new Set(items.map((i) => i.id).filter(Boolean));
  const removed = existing.filter((m) => !keepIds.has(m.id));

  await prisma.$transaction([
    prisma.media.deleteMany({ where: { id: { in: removed.map((m) => m.id) } } }),
    ...items.map((item, order) =>
      item.id && existing.some((m) => m.id === item.id)
        ? prisma.media.update({ where: { id: item.id }, data: { order } })
        : prisma.media.create({ data: { postId, url: item.url, type: item.type, order } })
    ),
  ]);

  await removeStorageObjects(removed.map((m) => m.url));
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parseMediaInput, removeStorageObjects, syncPostMedia } from "@/lib/media";
import { makeExcerpt } from "@/lib/format";
import { isCategory } from "@/lib/categories";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const isAuthor = post.authorId === user.id;
  const isAdmin = user.role === "ADMIN";
  if (!isAuthor && !isAdmin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const payload = await request.json();
  const data: {
    title?: string;
    body?: string;
    excerpt?: string;
    category?: string | null;
    status?: "PUBLISHED" | "PENDING" | "REJECTED";
  } = {};

  if (typeof payload.title === "string") {
    const title = payload.title.trim();
    if (!title) {
      return NextResponse.json({ error: "Title can't be empty." }, { status: 400 });
    }
    data.title = title;
  }

  if (typeof payload.body === "string") {
    const body = payload.body.trim();
    if (!body) {
      return NextResponse.json({ error: "Write-up can't be empty." }, { status: 400 });
    }
    data.body = body;
    data.excerpt = makeExcerpt(body);
  }

  if (payload.category !== undefined) {
    if (payload.category !== null && !isCategory(payload.category)) {
      return NextResponse.json({ error: "Unknown category." }, { status: 400 });
    }
    data.category = payload.category;
  }

  if (typeof payload.status === "string") {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only Meghna can approve or reject posts." },
        { status: 403 }
      );
    }
    if (!["PUBLISHED", "PENDING", "REJECTED"].includes(payload.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    data.status = payload.status;
  }

  let media = null;
  if (payload.media !== undefined) {
    media = parseMediaInput(payload.media);
    if (!media) {
      return NextResponse.json({ error: "Invalid media." }, { status: 400 });
    }
  }

  const updated = await prisma.post.update({ where: { slug }, data });
  if (media) await syncPostMedia(post.id, media);

  return NextResponse.json({ post: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug }, include: { media: true } });
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const isAuthor = post.authorId === user.id;
  const isAdmin = user.role === "ADMIN";
  if (!isAuthor && !isAdmin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  await prisma.post.delete({ where: { slug } });
  await removeStorageObjects(post.media.map((m) => m.url));
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parseMediaInput } from "@/lib/media";
import { makeExcerpt } from "@/lib/format";
import { isCategory } from "@/lib/categories";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const payload = await request.json();
  const title = String(payload.title ?? "").trim();
  const body = String(payload.body ?? "").trim();
  const media = parseMediaInput(payload.media ?? []);
  const category = payload.category ?? null;
  if (category !== null && !isCategory(category)) {
    return NextResponse.json({ error: "Unknown category." }, { status: 400 });
  }

  if (!title || !body) {
    return NextResponse.json(
      { error: "Title and write-up are both required." },
      { status: 400 }
    );
  }
  if (!media) {
    return NextResponse.json({ error: "Invalid media." }, { status: 400 });
  }

  const baseSlug = slugify(title, { lower: true, strict: true }) || "post";
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.post.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      body,
      excerpt: makeExcerpt(body),
      category,
      authorId: user.id,
      status: user.role === "ADMIN" ? "PUBLISHED" : "PENDING",
      media: {
        create: media.map((m, order) => ({ url: m.url, type: m.type, order })),
      },
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}

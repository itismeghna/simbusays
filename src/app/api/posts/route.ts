import { NextRequest, NextResponse } from "next/server";
import path from "path";
import crypto from "crypto";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { isAuthed } from "@/lib/auth";
import { supabaseAdmin, MEDIA_BUCKET } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();
  const files = form
    .getAll("media")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (!title || !body) {
    return NextResponse.json(
      { error: "Title and write-up are both required." },
      { status: 400 }
    );
  }

  const baseSlug = slugify(title, { lower: true, strict: true }) || "post";
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.post.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const mediaData: { url: string; type: string; order: number }[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = path.extname(file.name) || "";
    const filename = `${crypto.randomUUID()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabaseAdmin.storage
      .from(MEDIA_BUCKET)
      .upload(filename, buffer, {
        contentType: file.type || "application/octet-stream",
      });

    if (error) {
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(MEDIA_BUCKET)
      .getPublicUrl(filename);

    mediaData.push({
      url: publicUrlData.publicUrl,
      type: file.type.startsWith("video") ? "video" : "image",
      order: i,
    });
  }

  const trimmedBody = body.replace(/\s+/g, " ");
  const excerpt =
    trimmedBody.length > 160
      ? `${trimmedBody.slice(0, 160).replace(/\s+\S*$/, "")}…`
      : trimmedBody;

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      body,
      excerpt,
      media: { create: mediaData },
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}

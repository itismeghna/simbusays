import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  const name = String(body.name ?? "").trim().slice(0, 60);
  const text = String(body.body ?? "").trim().slice(0, 2000);

  if (!name || !text) {
    return NextResponse.json(
      { error: "Name and comment are both required." },
      { status: 400 }
    );
  }

  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: { postId: post.id, name, body: text },
  });

  return NextResponse.json({ comment }, { status: 201 });
}

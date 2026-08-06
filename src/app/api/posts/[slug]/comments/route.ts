import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Log in to leave a comment." }, { status: 401 });
  }

  const { slug } = await params;
  const body = await request.json();
  const text = String(body.body ?? "").trim().slice(0, 2000);

  if (!text) {
    return NextResponse.json({ error: "Comment can't be empty." }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: { postId: post.id, userId: user.id, body: text },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({ comment }, { status: 201 });
}

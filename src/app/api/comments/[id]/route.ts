import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }
  if (comment.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { body } = await request.json();
  const text = String(body ?? "").trim().slice(0, 2000);
  if (!text) {
    return NextResponse.json({ error: "Comment can't be empty." }, { status: 400 });
  }

  const updated = await prisma.comment.update({ where: { id }, data: { body: text } });
  return NextResponse.json({ comment: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }
  if (comment.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

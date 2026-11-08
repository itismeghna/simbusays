import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { removeStorageObjects } from "@/lib/media";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Only Meghna can change this photo." }, { status: 403 });
  }

  const { id } = await params;
  const portrait = await prisma.sitePortrait.findUnique({ where: { id } });
  if (!portrait) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }
  if (portrait.active) {
    return NextResponse.json(
      { error: "Switch to another photo before deleting this one." },
      { status: 400 }
    );
  }

  await prisma.sitePortrait.delete({ where: { id } });
  await removeStorageObjects([portrait.url]);
  return NextResponse.json({ ok: true });
}

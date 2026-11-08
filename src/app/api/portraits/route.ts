import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { storagePathFromUrl } from "@/lib/media";

/** Saves a newly uploaded photo and makes it the active one. Admin only. */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Only Meghna can change this photo." }, { status: 403 });
  }

  const { url } = await request.json();
  if (typeof url !== "string" || !storagePathFromUrl(url)) {
    return NextResponse.json({ error: "Invalid image." }, { status: 400 });
  }

  const [, portrait] = await prisma.$transaction([
    prisma.sitePortrait.updateMany({ where: { active: true }, data: { active: false } }),
    prisma.sitePortrait.create({ data: { url, active: true } }),
  ]);

  return NextResponse.json({ portrait }, { status: 201 });
}

/** Switches to an earlier photo, or back to the default with `id: null`. */
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Only Meghna can change this photo." }, { status: 403 });
  }

  const { id } = await request.json();
  if (id !== null && typeof id !== "string") {
    return NextResponse.json({ error: "Invalid photo." }, { status: 400 });
  }
  if (id && !(await prisma.sitePortrait.findUnique({ where: { id } }))) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.sitePortrait.updateMany({ where: { active: true }, data: { active: false } }),
    ...(id ? [prisma.sitePortrait.update({ where: { id }, data: { active: true } })] : []),
  ]);

  return NextResponse.json({ ok: true });
}

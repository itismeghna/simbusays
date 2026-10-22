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
    return NextResponse.json({ error: "Only Meghna can change the logo." }, { status: 403 });
  }

  const { id } = await params;
  const logo = await prisma.siteLogo.findUnique({ where: { id } });
  if (!logo) {
    return NextResponse.json({ error: "Logo not found." }, { status: 404 });
  }
  if (logo.active) {
    return NextResponse.json(
      { error: "Switch to another logo before deleting this one." },
      { status: 400 }
    );
  }

  await prisma.siteLogo.delete({ where: { id } });
  await removeStorageObjects([logo.url]);
  return NextResponse.json({ ok: true });
}

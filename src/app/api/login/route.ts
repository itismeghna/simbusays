import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const cleanEmail = String(email ?? "").trim().toLowerCase();
  const cleanPassword = String(password ?? "");

  const user = cleanEmail
    ? await prisma.user.findUnique({ where: { email: cleanEmail } })
    : null;

  const valid = user && (await bcrypt.compare(cleanPassword, user.passwordHash));
  if (!user || !valid) {
    return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  }

  await setSessionCookie(user.id);

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}

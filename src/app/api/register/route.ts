import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, name, password } = await request.json();

  const cleanEmail = String(email ?? "").trim().toLowerCase();
  const cleanName = String(name ?? "").trim().slice(0, 60);
  const cleanPassword = String(password ?? "");

  if (!cleanEmail || !cleanEmail.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }
  if (!cleanName) {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }
  if (cleanPassword.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(cleanPassword, 10);
  const user = await prisma.user.create({
    data: { email: cleanEmail, name: cleanName, passwordHash, role: "MEMBER" },
  });

  await setSessionCookie(user.id);

  return NextResponse.json(
    { user: { id: user.id, email: user.email, name: user.name, role: user.role } },
    { status: 201 }
  );
}

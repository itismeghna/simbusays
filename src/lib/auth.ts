import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const COOKIE_NAME = "simbu_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MEMBER";
};

type Payload = {
  userId: string;
  exp: number;
};

function secret() {
  return process.env.SESSION_SECRET || "simbu-fallback-secret";
}

function sign(data: string) {
  return crypto.createHmac("sha256", secret()).update(data).digest("hex");
}

export function createSessionToken(userId: string) {
  const payload: Payload = {
    userId,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(data);
  return `${data}.${signature}`;
}

function verifySessionToken(token: string): Payload | null {
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;
  const expected = sign(data);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as Payload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) return null;

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function requireUser(): Promise<SessionUser | null> {
  return getCurrentUser();
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}

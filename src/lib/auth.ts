import crypto from "crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "simbu_session";

export function expectedToken() {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "simbu";
  return crypto.createHmac("sha256", secret).update("simbu-author").digest("hex");
}

export function checkPassword(password: string) {
  return Boolean(process.env.ADMIN_PASSWORD) && password === process.env.ADMIN_PASSWORD;
}

export async function isAuthed() {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === expectedToken();
}

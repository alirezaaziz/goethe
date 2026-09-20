import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "goethe_admin";
const MAX_AGE = 60 * 60 * 12; // 12 Stunden

function secret() {
  const value = process.env.ADMIN_SECRET;
  if (!value) throw new Error("ADMIN_SECRET ist nicht gesetzt.");
  return value;
}

function sign(expiresAt: number) {
  return createHmac("sha256", secret()).update(String(expiresAt)).digest("hex");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD ist nicht gesetzt.");
  return safeEqual(input, expected);
}

export async function createSession() {
  const expiresAt = Date.now() + MAX_AGE * 1000;
  const store = await cookies();
  store.set(COOKIE, `${expiresAt}.${sign(expiresAt)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isAuthenticated() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [rawExpiry, signature] = value.split(".");
  const expiresAt = Number(rawExpiry);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now() || !signature) return false;
  try {
    return safeEqual(signature, sign(expiresAt));
  } catch {
    return false;
  }
}

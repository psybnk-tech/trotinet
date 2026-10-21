import { createHmac, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";

const scryptAsync = promisify(scrypt);
const SESSION_COOKIE = "trotinet_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) throw new Error("SESSION_SECRET must contain at least 32 bytes.");
  return secret;
}

export async function verifyAdminPassword(email: string, password: string) {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const encoded = process.env.ADMIN_PASSWORD_HASH ?? "";
  const [salt, expectedHex, extra] = encoded.split(":");
  if (!configuredEmail || !salt || !expectedHex || extra || !/^[a-f0-9]{32,}$/.test(expectedHex)) return false;
  if (email.trim().toLowerCase() !== configuredEmail || password.length > 200) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const actual = (await scryptAsync(password, salt, expected.length)) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function startAdminSession(email: string) {
  const payload = Buffer.from(JSON.stringify({ email, expires: Date.now() + SESSION_TTL_SECONDS * 1000 })).toString("base64url");
  const signature = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  const jar = await cookies();
  jar.set(SESSION_COOKIE, `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endAdminSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function isAdminAuthenticated() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const [payload, suppliedSignature, extra] = token.split(".");
  if (!payload || !suppliedSignature || extra) return false;
  try {
    const expectedSignature = createHmac("sha256", sessionSecret()).update(payload).digest();
    const supplied = Buffer.from(suppliedSignature, "base64url");
    if (supplied.length !== expectedSignature.length || !timingSafeEqual(supplied, expectedSignature)) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: string; expires?: number };
    return data.email === process.env.ADMIN_EMAIL?.trim().toLowerCase() && typeof data.expires === "number" && data.expires > Date.now();
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) throw new Error("UNAUTHORIZED");
}

export async function requireSameOrigin(request: Request) {
  const origin = (await headers()).get("origin");
  const allowedOrigin = new URL(process.env.APP_URL ?? request.url).origin;
  if (!origin || origin !== allowedOrigin) throw new Error("INVALID_ORIGIN");
}

export async function consumeRateLimit(kind: string, request: Request, limit: number, windowSeconds: number) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientAddress = forwarded || request.headers.get("x-real-ip") || "unknown";
  const windowStart = Math.floor(Date.now() / (windowSeconds * 1000));
  const identifier = createHmac("sha256", sessionSecret()).update(`${kind}:${clientAddress}:${windowStart}`).digest("hex");
  const bucket = await db.rateLimitBucket.upsert({ where: { id: identifier }, create: { id: identifier, count: 1 }, update: { count: { increment: 1 } } });
  if (Math.random() < 0.01) {
    await db.rateLimitBucket.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
  }
  return bucket.count <= limit;
}
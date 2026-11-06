import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { db, schema } from "@/db";
import { randomToken, sha256 } from "./security";

const COOKIE = "rltc_session";
const SESSION_DAYS = 14;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string | null) {
  // Always run a comparison so response time does not reveal whether the account exists.
  const target = hash ?? "$2b$12$YKY0HMGDqhuC6hk8y3cGLe3CHxc4.mSOyv4g3O63aP8Y/sWHTntKq";
  const ok = await bcrypt.compare(password, target);
  return hash ? ok : false;
}

export async function createSession(userId: number) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await db.insert(schema.sessions).values({ tokenHash: sha256(token), userId, expiresAt });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.delete(schema.sessions).where(eq(schema.sessions.tokenHash, sha256(token)));
  jar.delete(COOKIE);
}

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "customer";
  canViewPrices: boolean;
};

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      active: schema.users.active,
      canViewPrices: schema.users.canViewPrices,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(and(eq(schema.sessions.tokenHash, sha256(token)), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);
  const u = rows[0];
  if (!u || !u.active) return null;
  return { id: u.id, email: u.email, name: u.name, role: u.role, canViewPrices: u.canViewPrices };
});

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login?next=/admin");
  return user;
}

export async function requireCustomer() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  if (user.role === "admin") redirect("/admin");
  return user;
}

/** Create a one-time link for setting a password (new accounts and resets). Valid 72 hours. */
export async function createPasswordToken(userId: number) {
  const token = randomToken();
  await db.insert(schema.passwordTokens).values({
    tokenHash: sha256(token),
    userId,
    expiresAt: new Date(Date.now() + 72 * 3600_000),
  });
  return token;
}

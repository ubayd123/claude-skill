"use server";

import { redirect } from "next/navigation";
import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { createPasswordToken, createSession, destroySession, getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { layout, sendEmail } from "@/lib/email";
import { email, fd } from "@/lib/forms";
import { rateLimit } from "@/lib/rate-limit";
import { clientKey, sha256 } from "@/lib/security";
import { siteUrl } from "@/lib/site";
import type { FormState } from "./types";

function safeNext(next: string, fallback: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const addr = fd(formData, "email").trim().toLowerCase();
  const password = fd(formData, "password");
  const key = await clientKey();
  const ipLimit = await rateLimit(`login-ip:${key}`, 20, 900);
  const acctLimit = await rateLimit(`login-acct:${sha256(addr)}`, 8, 900);
  if (!ipLimit.ok || !acctLimit.ok) return { ok: false, message: "Too many sign-in attempts. Please wait 15 minutes and try again." };
  const rows = await db.select().from(schema.users).where(eq(schema.users.email, addr)).limit(1);
  const user = rows[0];
  const ok = await verifyPassword(password, user?.passwordHash ?? null);
  if (!user || !ok || !user.active) return { ok: false, message: "That email and password do not match an active account." };
  await createSession(user.id);
  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));
  redirect(safeNext(fd(formData, "next"), user.role === "admin" ? "/admin" : "/account"));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters")
  .max(200)
  .refine((p) => /[A-Za-z]/.test(p) && /[0-9]/.test(p), "Use letters and at least one number");

export async function setPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = fd(formData, "token");
  const pw = fd(formData, "password");
  if (pw !== fd(formData, "confirm")) return { ok: false, message: "The passwords do not match.", errors: { confirm: "Passwords do not match" } };
  const parsed = passwordSchema.safeParse(pw);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message, errors: { password: parsed.error.issues[0].message } };
  const rows = await db
    .select()
    .from(schema.passwordTokens)
    .where(and(eq(schema.passwordTokens.tokenHash, sha256(token)), gt(schema.passwordTokens.expiresAt, new Date()), isNull(schema.passwordTokens.usedAt)))
    .limit(1);
  const row = rows[0];
  if (!row) return { ok: false, message: "This link has expired or has already been used. Ask us for a new one." };
  await db.update(schema.users).set({ passwordHash: await hashPassword(parsed.data) }).where(eq(schema.users.id, row.userId));
  await db.update(schema.passwordTokens).set({ usedAt: new Date() }).where(eq(schema.passwordTokens.tokenHash, row.tokenHash));
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, row.userId));
  await createSession(row.userId);
  const u = await db.select({ role: schema.users.role }).from(schema.users).where(eq(schema.users.id, row.userId));
  redirect(u[0]?.role === "admin" ? "/admin" : "/account");
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = email.safeParse(fd(formData, "email"));
  const generic: FormState = { ok: true, message: "If that email belongs to an account, a reset link is on its way." };
  if (!parsed.success) return { ok: false, message: "Enter a valid email address." };
  const key = await clientKey();
  if (!(await rateLimit(`reset:${key}`, 5, 3600)).ok) return generic;
  const rows = await db.select().from(schema.users).where(eq(schema.users.email, parsed.data)).limit(1);
  const user = rows[0];
  if (user?.active) {
    const token = await createPasswordToken(user.id);
    const msg = layout("Reset your password", "Use the link below to choose a new password. It works once and expires in 72 hours. If you did not ask for this, you can ignore this email.", [["Link", `${siteUrl()}/set-password/${token}`]]);
    await sendEmail({ to: user.email, subject: "Reset your password | Redlight Therapy Co.", html: msg.html, text: msg.text, kind: "password_reset" });
  }
  return generic;
}

export async function currentUserId() {
  return (await getCurrentUser())?.id ?? null;
}

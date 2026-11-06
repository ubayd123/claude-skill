import "server-only";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { headers } from "next/headers";

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/** Client IP, hashed with APP_SECRET so raw IPs are never stored. */
export async function clientKey() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const secret = process.env.APP_SECRET || "rltc";
  return createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

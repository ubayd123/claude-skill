import { sql } from "drizzle-orm";
import { db } from "@/db";
import { emailProvider } from "@/lib/email";

/** Uptime monitoring endpoint: 200 when the app and database are healthy. */
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, db: "ok", email: emailProvider() ?? "not_configured" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ ok: false, db: "error" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

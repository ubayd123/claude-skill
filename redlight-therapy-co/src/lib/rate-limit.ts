import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";

/** Fixed-window rate limit stored in Postgres, so it holds across server instances. */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const result = await db.execute<{ count: number }>(sql`
    INSERT INTO rate_limits (key, count, reset_at)
    VALUES (${key}, 1, now() + make_interval(secs => ${windowSeconds}))
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits.reset_at < now() THEN 1 ELSE rate_limits.count + 1 END,
      reset_at = CASE WHEN rate_limits.reset_at < now() THEN excluded.reset_at ELSE rate_limits.reset_at END
    RETURNING count`);
  const count = Number(result.rows[0]?.count ?? 0);
  return { ok: count <= limit, count };
}

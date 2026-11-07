import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pool?: Pool };

function createPool() {
  // DATABASE_URL, or POSTGRES_URL as set by some Vercel database integrations.
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return new Pool({
    connectionString: url,
    max: process.env.VERCEL ? 3 : 10,
    ssl: process.env.DATABASE_SSL === "require" ? { rejectUnauthorized: true } : undefined,
  });
}

export const pool = globalForDb.pool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
export { schema };

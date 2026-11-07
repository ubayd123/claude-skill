import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: process.env.DATABASE_SSL === "require" ? { rejectUnauthorized: true } : undefined,
  });
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  await pool.end();
  console.log("Migrations applied");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import "server-only";
import { asc, eq, isNotNull } from "drizzle-orm";
import { db, schema } from "@/db";
import type { SessionUser } from "./auth";
import { getPricingMode } from "./settings";

export type PriceRow = typeof schema.prices.$inferSelect;
export type Tier = typeof schema.volumeTiers.$inferSelect;

/**
 * The only gate for trade prices. Prices are confidential: they are shown only to
 * signed-in, active, approved customers with price access, and only while the admin
 * pricing mode is "approved". Admins always see them in the dashboard.
 */
export async function canSeePrices(user: SessionUser | null) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!user.canViewPrices) return false;
  return (await getPricingMode()) === "approved";
}

export async function getPriceMap(user: SessionUser | null) {
  const map = new Map<number, PriceRow>();
  if (!(await canSeePrices(user))) return map;
  const rows = await db.select().from(schema.prices).where(isNotNull(schema.prices.productId));
  for (const r of rows) if (r.productId) map.set(r.productId, r);
  return map;
}

export async function getTiers() {
  return db.select().from(schema.volumeTiers).orderBy(asc(schema.volumeTiers.sort), asc(schema.volumeTiers.minQty));
}

/** Unit trade price for a quantity, applying the documented volume tier (per product). */
export function unitPriceFor(price: PriceRow, quantity: number, tiers: Tier[]) {
  if (!price.tradePrice) return null;
  const base = Number(price.tradePrice);
  const tier = tiers.find((t) => quantity >= t.minQty && (t.maxQty === null || quantity <= t.maxQty));
  const discount = tier ? Number(tier.discountPercent) : 0;
  return (Math.round(base * (100 - discount)) / 100).toFixed(2);
}

export async function getPriceForProduct(productId: number) {
  const rows = await db.select().from(schema.prices).where(eq(schema.prices.productId, productId)).limit(1);
  return rows[0] ?? null;
}

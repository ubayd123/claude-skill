/**
 * Seeds categories, products, documents, trade prices, volume tiers, trade terms and the first admin.
 * Safe to re-run: existing rows (matched by slug / name / email) are left untouched,
 * so admin edits are never overwritten. Pass --force to overwrite product content from the PDFs.
 */
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, pool, schema } from "../src/db";
import { existsSync, readFileSync } from "node:fs";
import { emptyTradeTerms, generalDocs, seedCategories, seedProducts, type SeedPrice, type SeedTier, type TradeTerms } from "../src/data/catalogue";

// Confidential pricing lives outside source control. Point PRICE_LIST_FILE elsewhere if needed.
const priceFile = process.env.PRICE_LIST_FILE || "private/price-list.json";
const priceData: { prices: SeedPrice[]; tiers: SeedTier[]; tradeTerms: TradeTerms } = existsSync(priceFile)
  ? JSON.parse(readFileSync(priceFile, "utf8"))
  : { prices: [], tiers: [], tradeTerms: emptyTradeTerms };
if (!existsSync(priceFile)) console.warn(`No ${priceFile}: seeding without trade prices (add them in Admin → Pricing).`);
const seedPrices = priceData.prices;
const seedTiers = priceData.tiers;
const seedTradeTerms = priceData.tradeTerms;

const force = process.argv.includes("--force");

async function main() {
  const catIds = new Map<string, number>();
  for (const c of seedCategories) {
    const existing = await db.select().from(schema.categories).where(eq(schema.categories.slug, c.slug));
    if (existing[0] && !force) { catIds.set(c.slug, existing[0].id); continue; }
    if (existing[0]) {
      await db.update(schema.categories).set(c).where(eq(schema.categories.id, existing[0].id));
      catIds.set(c.slug, existing[0].id);
    } else {
      const [row] = await db.insert(schema.categories).values(c).returning({ id: schema.categories.id });
      catIds.set(c.slug, row.id);
    }
  }

  const productIds = new Map<string, number>();
  for (const p of seedProducts) {
    const { docs, category, ...fields } = p;
    const values = { ...fields, categoryId: catIds.get(category) ?? null, seoTitle: `${p.name} | Wholesale` };
    const existing = await db.select().from(schema.products).where(eq(schema.products.slug, p.slug));
    let id: number;
    if (existing[0]) {
      id = existing[0].id;
      if (force) await db.update(schema.products).set({ ...values, updatedAt: new Date() }).where(eq(schema.products.id, id));
    } else {
      [{ id }] = await db.insert(schema.products).values(values).returning({ id: schema.products.id });
    }
    productIds.set(p.slug, id);
    const haveDocs = await db.select().from(schema.productDocuments).where(eq(schema.productDocuments.productId, id));
    if (haveDocs.length === 0) {
      for (const [i, d] of docs.entries()) {
        await db.insert(schema.productDocuments).values({ ...d, productId: id, visibility: "public", sort: i });
      }
    }
  }

  const general = await db.select().from(schema.productDocuments);
  for (const d of generalDocs) {
    if (!general.some((g) => g.fileName === d.fileName)) {
      await db.insert(schema.productDocuments).values({ ...d, productId: null, visibility: "public", sort: 0 });
    }
  }

  const priceRows = await db.select().from(schema.prices);
  for (const pr of seedPrices) {
    if (priceRows.some((r) => r.sourceName === pr.sourceName)) continue;
    await db.insert(schema.prices).values({
      sourceName: pr.sourceName,
      productId: pr.productSlug ? productIds.get(pr.productSlug) ?? null : null,
      currency: "GBP",
      tradePrice: pr.trade,
      rrp: pr.rrp,
      resellerMargin: pr.margin,
      moq: seedTradeTerms.moq,
      notes: pr.note,
    });
  }

  const tiers = await db.select().from(schema.volumeTiers);
  if (tiers.length === 0 && seedTiers.length) await db.insert(schema.volumeTiers).values(seedTiers);

  for (const [key, value] of [["trade_terms", seedTradeTerms], ["pricing_mode", "approved"]] as const) {
    await db.insert(schema.settings).values({ key, value }).onConflictDoNothing();
  }

  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "";
  if (email) {
    const existing = await db.select().from(schema.users).where(eq(schema.users.email, email));
    if (!existing[0]) {
      if (password.length < 12) throw new Error("Set ADMIN_PASSWORD (12+ characters) to create the first admin");
      await db.insert(schema.users).values({ email, name: "Administrator", role: "admin", passwordHash: await bcrypt.hash(password, 12) });
      console.log(`Admin created: ${email}`);
    }
  }
  console.log(`Seeded ${seedCategories.length} categories, ${seedProducts.length} products, ${seedPrices.length} price rows`);
}

main()
  .then(() => pool.end())
  .catch(async (e) => {
    console.error(e);
    await pool.end();
    process.exit(1);
  });

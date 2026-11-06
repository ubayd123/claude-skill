import "server-only";
import { cache } from "react";
import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { db, schema } from "@/db";

export type Product = typeof schema.products.$inferSelect;
export type Category = typeof schema.categories.$inferSelect;
export type ProductWithCategory = Product & { category: Category | null };

export const getCategories = cache(async () =>
  db.select().from(schema.categories).orderBy(asc(schema.categories.sort), asc(schema.categories.name)),
);

export const getPublishedProducts = cache(async (): Promise<ProductWithCategory[]> => {
  const rows = await db
    .select()
    .from(schema.products)
    .leftJoin(schema.categories, eq(schema.categories.id, schema.products.categoryId))
    .where(eq(schema.products.status, "published"))
    .orderBy(asc(schema.products.sort), asc(schema.products.name));
  return rows.map((r) => ({ ...r.products, category: r.categories }));
});

export const getProductBySlug = cache(async (slug: string) => {
  const all = await getPublishedProducts();
  return all.find((p) => p.slug === slug) ?? null;
});

export const getCategoryBySlug = cache(async (slug: string) => {
  const rows = await db.select().from(schema.categories).where(eq(schema.categories.slug, slug)).limit(1);
  return rows[0] ?? null;
});

/** Documents a viewer may see. Customer-only docs are hidden from the public. */
export async function getDocuments(opts: { productId?: number | null; includeCustomerDocs: boolean }) {
  const vis = opts.includeCustomerDocs
    ? undefined
    : eq(schema.productDocuments.visibility, "public");
  const productFilter =
    opts.productId === undefined
      ? undefined
      : opts.productId === null
        ? isNull(schema.productDocuments.productId)
        : eq(schema.productDocuments.productId, opts.productId);
  return db
    .select()
    .from(schema.productDocuments)
    .where(and(vis, productFilter))
    .orderBy(asc(schema.productDocuments.sort), asc(schema.productDocuments.id));
}

export async function getProductsByIds(ids: number[]) {
  if (ids.length === 0) return [];
  return db
    .select()
    .from(schema.products)
    .where(and(inArray(schema.products.id, ids), eq(schema.products.status, "published")));
}

export function paragraphs(text: string) {
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}


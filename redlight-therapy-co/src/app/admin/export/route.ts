import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return new Response("Forbidden", { status: 403 });
  const rows = await db.select({ p: schema.products, c: schema.categories }).from(schema.products).leftJoin(schema.categories, eq(schema.categories.id, schema.products.categoryId)).orderBy(asc(schema.products.sort));
  const products = rows.map(({ p, c }) => {
    const { id: _id, categoryId: _cid, createdAt: _ca, updatedAt: _ua, gallery: _g, ...rest } = p;
    void _id; void _cid; void _ca; void _ua; void _g;
    return { ...rest, category: c?.slug ?? null };
  });
  return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), products }, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="products.json"', "Cache-Control": "no-store" },
  });
}

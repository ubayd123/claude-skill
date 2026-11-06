import { requireAdmin } from "@/lib/auth";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import DocumentManager from "@/components/admin/DocumentManager";
import { PageTitle, Panel } from "@/components/admin/ui";

export default async function DocumentsAdmin() {
  await requireAdmin();
  const [docs, products] = await Promise.all([
    db.select().from(schema.productDocuments).orderBy(asc(schema.productDocuments.productId), asc(schema.productDocuments.sort)),
    db.select({ id: schema.products.id, name: schema.products.name }).from(schema.products).orderBy(asc(schema.products.sort)),
  ]);
  return (
    <>
      <PageTitle title="Documents" sub="PDFs offered for download on product pages and in the customer dashboard." />
      <Panel><DocumentManager docs={docs} products={products} /></Panel>
    </>
  );
}

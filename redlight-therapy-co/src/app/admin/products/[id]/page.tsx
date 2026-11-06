import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import ProductForm from "@/components/admin/ProductForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import DocumentManager from "@/components/admin/DocumentManager";
import { PageTitle, Panel } from "@/components/admin/ui";
import { deleteProduct } from "@/app/actions/admin";
import { getCategories } from "@/lib/catalog";

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  const { saved } = await searchParams;
  const product = (await db.select().from(schema.products).where(eq(schema.products.id, id)))[0];
  if (!product) notFound();
  const docs = await db.select().from(schema.productDocuments).where(eq(schema.productDocuments.productId, id));
  return (
    <>
      <PageTitle title={product.name} sub={saved ? "Product created." : undefined}>
        <div className="flex gap-2">
          <Link href={`/products/${product.slug}`} target="_blank" className="btn btn-ghost btn-sm">View on site ↗</Link>
          <Link href="/admin/products" className="btn btn-ghost btn-sm">← All products</Link>
        </div>
      </PageTitle>
      <ProductForm product={product} categories={await getCategories()} />
      <Panel title="Documents for this product" className="mt-8">
        <DocumentManager docs={docs} productId={product.id} />
      </Panel>
      <Panel title="Danger zone" className="mt-8">
        <form action={deleteProduct} className="flex flex-wrap items-center gap-4">
          <input type="hidden" name="id" value={product.id} />
          <p className="text-sm text-muted">Deleting removes the product and its documents from the website. Past enquiries keep their product names.</p>
          <ConfirmButton label="Delete product" message={`Delete ${product.name}? This cannot be undone.`} />
        </form>
      </Panel>
    </>
  );
}

import { requireAdmin } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { Badge, PageTitle, Table } from "@/components/admin/ui";

export default async function AdminProducts() {
  await requireAdmin();
  const rows = await db.select({ p: schema.products, c: schema.categories }).from(schema.products).leftJoin(schema.categories, eq(schema.categories.id, schema.products.categoryId)).orderBy(asc(schema.products.sort), asc(schema.products.name));
  return (
    <>
      <PageTitle title="Products" sub="Add, edit and remove products. Changes appear on the website immediately.">
        <Link href="/admin/products/new" className="btn btn-red btn-sm">+ Add product</Link>
      </PageTitle>
      <Table head={["", "Product", "Category", "Featured", "Status", ""]}>
        {rows.map(({ p, c }) => (
          <tr key={p.id} className="hover:bg-paper">
            <td className="w-16 px-4 py-2"><span className="relative block h-12 w-12 overflow-hidden rounded-lg bg-night">{p.image && <Image src={p.image} alt="" fill sizes="48px" className="object-cover" />}</span></td>
            <td className="px-4 py-3 font-semibold"><Link href={`/admin/products/${p.id}`} className="hover:text-red">{p.name}</Link><div className="text-xs font-normal text-muted">/products/{p.slug}</div></td>
            <td className="px-4 py-3">{c?.name ?? "–"}</td>
            <td className="px-4 py-3">{p.featured ? "Yes" : ""}</td>
            <td className="px-4 py-3"><Badge value={p.status} /></td>
            <td className="px-4 py-3 text-right"><Link href={`/admin/products/${p.id}`} className="text-red hover:underline">Edit</Link></td>
          </tr>
        ))}
      </Table>
    </>
  );
}

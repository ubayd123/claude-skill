import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireCustomer } from "@/lib/auth";
import { IconDownload } from "@/components/icons/Icons";

export default async function DocumentsPage() {
  await requireCustomer();
  const [docs, products] = await Promise.all([
    db.select().from(schema.productDocuments).orderBy(asc(schema.productDocuments.sort), asc(schema.productDocuments.id)),
    db.select({ id: schema.products.id, name: schema.products.name }).from(schema.products),
  ]);
  const name = (id: number | null) => (id ? products.find((p) => p.id === id)?.name : "General") ?? "General";
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {docs.map((d) => (
        <li key={d.id}>
          <a href={`/docs/${d.id}`} target="_blank" rel="noopener" className="card group flex items-start gap-4 p-5 transition hover:border-red">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-white group-hover:bg-red"><IconDownload className="h-5 w-5" /></span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted">{name(d.productId)}</span>
              <span className="mt-1 block font-semibold">{d.title}</span>
              <span className="block text-sm text-muted">{d.description}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

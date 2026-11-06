import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { desc, eq, ilike, or, and, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import { Badge, PageTitle, Table, fmtDate } from "@/components/admin/ui";
import { ENQUIRY_STATUSES, STATUS_LABEL } from "@/lib/site";

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireAdmin();
  const { status, q } = await searchParams;
  const filters: SQL[] = [];
  const st = ENQUIRY_STATUSES.find((s) => s === status);
  if (st) filters.push(eq(schema.enquiries.status, st));
  if (q) {
    const like = `%${q.replace(/[%_]/g, "")}%`;
    const term = or(ilike(schema.enquiries.reference, like), ilike(schema.enquiries.businessName, like), ilike(schema.enquiries.email, like), ilike(schema.enquiries.customerName, like));
    if (term) filters.push(term);
  }
  const list = await db.select().from(schema.enquiries).where(filters.length ? and(...filters) : undefined).orderBy(desc(schema.enquiries.createdAt)).limit(300);
  return (
    <>
      <PageTitle title="Enquiries" sub="Order, bulk, wholesale, distribution and contact enquiries from the website." />
      <form className="mb-6 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search reference, business or email" className="input max-w-xs py-2 text-sm" />
        <select name="status" defaultValue={status ?? ""} className="input max-w-[12rem] py-2 text-sm">
          <option value="">All statuses</option>
          {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <button className="btn btn-ink btn-sm">Filter</button>
      </form>
      <Table head={["Reference", "Received", "Type", "Business / name", "Email", "Emails", "Status"]}>
        {list.map((e) => (
          <tr key={e.id} className="hover:bg-paper">
            <td className="px-4 py-3 font-semibold"><Link href={`/admin/enquiries/${e.id}`} className="text-red underline-offset-2 hover:underline">{e.reference}</Link></td>
            <td className="px-4 py-3 text-muted">{fmtDate(e.createdAt)}</td>
            <td className="px-4 py-3 capitalize">{e.kind}</td>
            <td className="px-4 py-3">{e.businessName || "–"}<div className="text-xs text-muted">{e.customerName}</div></td>
            <td className="px-4 py-3">{e.email}</td>
            <td className="px-4 py-3"><Badge value={e.businessEmailStatus} /></td>
            <td className="px-4 py-3"><Badge value={e.status} /></td>
          </tr>
        ))}
      </Table>
      {list.length === 0 && <p className="mt-6 text-sm text-muted">No enquiries match.</p>}
    </>
  );
}

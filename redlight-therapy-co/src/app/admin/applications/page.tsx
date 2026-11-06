import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { Badge, PageTitle, Table, fmtDate } from "@/components/admin/ui";

export default async function ApplicationsPage() {
  await requireAdmin();
  const list = await db.select().from(schema.applications).orderBy(desc(schema.applications.createdAt)).limit(300);
  return (
    <>
      <PageTitle title="Wholesale applications" sub="Approve to create a customer account and email a set-password link." />
      <Table head={["Business", "Contact", "Country", "Type", "Received", "Status"]}>
        {list.map((a) => (
          <tr key={a.id} className="hover:bg-paper">
            <td className="px-4 py-3 font-semibold"><Link href={`/admin/applications/${a.id}`} className="text-red hover:underline">{a.businessName}</Link></td>
            <td className="px-4 py-3">{a.contactName}<div className="text-xs text-muted">{a.email}</div></td>
            <td className="px-4 py-3">{a.country}</td>
            <td className="px-4 py-3">{a.businessType}</td>
            <td className="px-4 py-3 text-muted">{fmtDate(a.createdAt)}</td>
            <td className="px-4 py-3"><Badge value={a.status} /></td>
          </tr>
        ))}
      </Table>
      {list.length === 0 && <p className="mt-6 text-sm text-muted">No applications yet.</p>}
    </>
  );
}

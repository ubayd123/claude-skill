import { requireAdmin } from "@/lib/auth";
import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { Badge, PageTitle, Table, fmtDate } from "@/components/admin/ui";
import { emailProvider } from "@/lib/email";

export default async function EmailLog() {
  await requireAdmin();
  const rows = await db.select().from(schema.emailLog).orderBy(desc(schema.emailLog.createdAt)).limit(300);
  return (
    <>
      <PageTitle title="Email log" sub={`Every email the website tries to send. Provider: ${emailProvider() ?? "not configured"}.`} />
      <Table head={["Sent", "To", "Subject", "Type", "Result", "Error"]}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="px-4 py-3 text-muted">{fmtDate(r.createdAt)}</td>
            <td className="px-4 py-3">{r.to}</td>
            <td className="px-4 py-3">{r.subject}</td>
            <td className="px-4 py-3 text-xs text-muted">{r.kind}</td>
            <td className="px-4 py-3"><Badge value={r.status} /></td>
            <td className="max-w-xs truncate px-4 py-3 text-xs text-muted" title={r.error}>{r.error}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}

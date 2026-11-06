import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import AdminForm from "@/components/admin/AdminForm";
import { Badge, PageTitle, Panel, fmtDate } from "@/components/admin/ui";
import { updateEnquiry } from "@/app/actions/admin";
import { formatMoney } from "@/lib/money";
import { ENQUIRY_STATUSES, STATUS_LABEL } from "@/lib/site";

export default async function EnquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  const e = (await db.select().from(schema.enquiries).where(eq(schema.enquiries.id, id)))[0];
  if (!e) notFound();
  const items = await db.select().from(schema.enquiryItems).where(eq(schema.enquiryItems.enquiryId, id));
  const rows: [string, string][] = [
    ["Customer name", e.customerName], ["Business name", e.businessName], ["Email", e.email], ["Telephone", e.phone], ["Country", e.country],
    ["Type", e.kind], ["Subject", e.subject], ["Submitted", fmtDate(e.createdAt)], ["Account", e.userId ? `Customer #${e.userId}` : "Guest"],
  ];
  return (
    <>
      <PageTitle title={e.reference} sub={`${e.businessName || e.customerName} · ${fmtDate(e.createdAt)}`}>
        <Link href="/admin/enquiries" className="btn btn-ghost btn-sm">← All enquiries</Link>
      </PageTitle>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel title="Products">
            {items.length === 0 ? <p className="text-sm text-muted">No products (message only).</p> : (
              <ul className="divide-y divide-line text-sm">
                {items.map((i) => (
                  <li key={i.id} className="flex justify-between gap-4 py-2">
                    <span><strong>{i.quantity} ×</strong> {i.productName}{i.model && <span className="text-muted"> · {i.model}</span>}</span>
                    <span className="text-muted">{i.unitPrice ? `${formatMoney(i.unitPrice, i.currency)} each (customer's trade price)` : "Price to quote"}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Customer">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {rows.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}
            </dl>
            {e.notes && <div className="mt-4 whitespace-pre-wrap rounded-xl bg-paper p-4 text-sm">{e.notes}</div>}
            <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: your enquiry ${e.reference}`)}`} className="btn btn-red btn-sm mt-5">Reply by email</a>
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Status">
            <AdminForm action={updateEnquiry}>
              <input type="hidden" name="id" value={e.id} />
              <div className="field">
                <label htmlFor="st">Status</label>
                <select id="st" name="status" defaultValue={e.status} className="input text-sm">
                  {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="an">Internal note</label>
                <textarea id="an" name="adminNote" defaultValue={e.adminNote} rows={4} className="input text-sm" />
              </div>
            </AdminForm>
          </Panel>
          <Panel title="Email delivery">
            <p className="flex justify-between text-sm">To business inbox <Badge value={e.businessEmailStatus} /></p>
            <p className="mt-2 flex justify-between text-sm">Customer confirmation <Badge value={e.ackEmailStatus} /></p>
          </Panel>
        </div>
      </div>
    </>
  );
}
